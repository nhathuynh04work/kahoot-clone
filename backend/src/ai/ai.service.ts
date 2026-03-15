import { Injectable, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { DocumentStatus, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_DIMENSIONS = 768;
const GENERATION_MODEL = "gemini-1.5-flash";
const RAG_TOP_K = 10;

const PROMPT_VALIDATION_SYSTEM = `You must determine if a user's request is appropriate for generating educational quiz questions.

Consider: Is the request clear enough to understand what topic or questions to generate? Is it a legitimate educational topic? Is it not offensive, harmful, or inappropriate?

Reply ONLY with valid JSON (no markdown): {"valid": true} or {"valid": false, "reason": "brief explanation why it's unclear or inappropriate"}`;

const SYSTEM_PROMPT_RAG = `You are a quiz generator. Given document context and a user prompt, generate multiple-choice quiz questions as structured JSON.

Output ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "questions": [
    {
      "text": "Question text here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true }
      ]
    }
  ]
}

Rules:
- Use ONLY information from the provided context. Do not invent facts.
- Each question must have between 2 and 4 options.
- Exactly one option per question must have "isCorrect": true.
- Questions should be clear, unambiguous, and appropriate for the topic.
- Generate 3-8 questions based on the context quality and user request.`;

const SYSTEM_PROMPT_FREEFORM = `You are a quiz generator. Given a user's topic or request, generate multiple-choice quiz questions using your knowledge.

Output ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "questions": [
    {
      "text": "Question text here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true }
      ]
    }
  ]
}

Rules:
- Generate questions based on the user's topic or request. Use accurate, educational content.
- Each question must have between 2 and 4 options.
- Exactly one option per question must have "isCorrect": true.
- Questions should be clear, unambiguous, and appropriate.
- Generate 3-8 questions.`;

export interface GeneratedOption {
    text: string;
    isCorrect: boolean;
}

export interface GeneratedQuestion {
    text: string;
    options: GeneratedOption[];
}

export interface GenerateQuestionsResult {
    questions: GeneratedQuestion[];
}

interface DocumentChunkRow {
    id: number;
    documentId: number;
    content: string;
    chunkIndex: number;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly genai: GoogleGenAI | null = null;

    constructor(
        private prisma: PrismaService,
        config: ConfigService,
    ) {
        const apiKey = config.get<string>("GEMINI_API_KEY");
        if (apiKey) {
            this.genai = new GoogleGenAI({ apiKey });
        }
    }

    /**
     * Generates quiz questions from a user prompt.
     * - With documentId: uses RAG (embedding + cosine similarity) to retrieve context, then generates from that context.
     * - Without documentId: generates questions purely from the user's prompt using AI knowledge.
     *
     * Rejects unclear or inappropriate prompts with a helpful message.
     */
    async generateQuestions(
        userId: number,
        userPrompt: string,
        documentId?: number | null,
    ): Promise<GenerateQuestionsResult> {
        const genai = this.genai;
        if (!genai) {
            throw new BadRequestException("GEMINI_API_KEY is not configured");
        }

        if (!userPrompt?.trim()) {
            throw new BadRequestException("User prompt is required");
        }

        const validation = await this.validatePrompt(genai, userPrompt);
        if (!validation.valid) {
            const message = validation.reason ?? "Your prompt is unclear or not appropriate for quiz generation.";
            throw new BadRequestException(message);
        }

        if (documentId != null) {
            return this.generateWithRag(genai, userId, documentId, userPrompt);
        }

        return this.generateFreestyle(genai, userPrompt);
    }

    private async validatePrompt(genai: GoogleGenAI, prompt: string): Promise<{ valid: boolean; reason?: string }> {
        const fullPrompt = `${PROMPT_VALIDATION_SYSTEM}\n\nUser request: ${prompt}`;
        const response = await genai.models.generateContent({
            model: GENERATION_MODEL,
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text?.trim();
        if (!text) return { valid: true };

        try {
            const clean = text.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
            const parsed = JSON.parse(clean) as { valid?: boolean; reason?: string };
            return {
                valid: parsed.valid === true,
                reason: parsed.reason,
            };
        } catch {
            return { valid: true };
        }
    }

    private async generateWithRag(
        genai: GoogleGenAI,
        userId: number,
        documentId: number,
        userPrompt: string,
    ): Promise<GenerateQuestionsResult> {
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!doc) {
            throw new ForbiddenException("Document not found");
        }

        if (doc.status !== DocumentStatus.READY) {
            throw new BadRequestException(
                `Document is not ready for quiz generation (status: ${doc.status}). Wait for indexing to complete.`,
            );
        }

        this.logger.log(`[doc ${documentId}] Generating questions for prompt: "${userPrompt.slice(0, 60)}..."`);

        const embedding = await this.embedQuery(genai, userPrompt);
        const chunks = await this.retrieveChunks(documentId, embedding);
        const context = chunks.map((c) => c.content).join("\n\n");

        if (!context.trim()) {
            throw new BadRequestException(
                "No relevant context found in the document. The document may need to be re-indexed with the same embedding model.",
            );
        }

        const userMessage = `Context from the document:\n\n${context}\n\n---\n\nUser request: ${userPrompt}`;
        const jsonText = await this.generateWithGemini(genai, SYSTEM_PROMPT_RAG, userMessage);
        const result = this.parseStructuredOutput(jsonText);

        this.logger.log(`[doc ${documentId}] Generated ${result.questions.length} questions`);

        return result;
    }

    private async generateFreestyle(
        genai: GoogleGenAI,
        userPrompt: string,
    ): Promise<GenerateQuestionsResult> {
        this.logger.log(`Generating freestyle questions for prompt: "${userPrompt.slice(0, 60)}..."`);

        const jsonText = await this.generateWithGemini(genai, SYSTEM_PROMPT_FREEFORM, userPrompt);
        const result = this.parseStructuredOutput(jsonText);

        this.logger.log(`Generated ${result.questions.length} freestyle questions`);

        return result;
    }

    private async embedQuery(genai: GoogleGenAI, text: string): Promise<number[]> {
        const response = await genai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
                taskType: "RETRIEVAL_QUERY",
                outputDimensionality: EMBEDDING_DIMENSIONS,
            },
        });

        const values = response.embeddings?.[0]?.values;
        if (!values || values.length !== EMBEDDING_DIMENSIONS) {
            throw new Error(
                `Unexpected embedding dimension: ${values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`,
            );
        }

        return values;
    }

    private async retrieveChunks(
        documentId: number,
        embedding: number[],
        limit: number = RAG_TOP_K,
    ): Promise<DocumentChunkRow[]> {
        const vectorStr = `[${embedding.join(",")}]`;

        const rows = await this.prisma.$queryRaw<DocumentChunkRow[]>`
            SELECT id, "documentId", content, "chunkIndex"
            FROM "DocumentChunk"
            WHERE "documentId" = ${documentId}
            ORDER BY embedding <=> ${Prisma.raw(vectorStr)}::vector
            LIMIT ${limit}
        `;

        return rows;
    }

    private async generateWithGemini(
        genai: GoogleGenAI,
        systemPrompt: string,
        userMessage: string,
    ): Promise<string> {
        const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

        const response = await genai.models.generateContent({
            model: GENERATION_MODEL,
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text;
        if (!text?.trim()) {
            throw new Error("Gemini returned empty response");
        }

        return text.trim();
    }

    private parseStructuredOutput(jsonText: string): GenerateQuestionsResult {
        let parsed: { questions?: GeneratedQuestion[] };

        try {
            const clean = jsonText
                .replace(/^```json\s*/i, "")
                .replace(/\s*```\s*$/i, "")
                .trim();
            parsed = JSON.parse(clean) as { questions?: GeneratedQuestion[] };
        } catch (err) {
            this.logger.warn(`Failed to parse Gemini JSON: ${err instanceof Error ? err.message : String(err)}`);
            throw new Error("Failed to parse generated questions as JSON");
        }

        const questions = parsed?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Generated output has no questions array");
        }

        const validated: GeneratedQuestion[] = questions
            .filter((q): q is GeneratedQuestion => {
                if (!q || typeof q.text !== "string" || !Array.isArray(q.options)) return false;
                const optCount = q.options.length;
                if (optCount < 2 || optCount > 4) return false;
                const correctCount = q.options.filter(
                    (o) => o && typeof o.text === "string" && o.isCorrect === true,
                ).length;
                return correctCount === 1;
            })
            .map((q) => ({
                text: q.text.trim(),
                options: q.options
                    .filter((o) => o && typeof o.text === "string")
                    .map((o) => ({
                        text: (o.text as string).trim(),
                        isCorrect: Boolean(o.isCorrect),
                    })),
            }));

        return { questions: validated };
    }
}
