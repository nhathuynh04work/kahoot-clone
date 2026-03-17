import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { DocumentStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiQuizChatService } from "./ai-quiz-chat.service";
import {
    EMBEDDING_DIMENSIONS,
    PROMPT_VALIDATION_SYSTEM,
    RAG_TOP_K,
    SYSTEM_PROMPT_FREEFORM,
    SYSTEM_PROMPT_RAG,
} from "./ai.constants";
import type { GenerateQuestionsResult, GeneratedQuestion } from "./ai.types";
import { AiClient } from "./ai.client";
import { QUIZ_RESPONSE_SCHEMA } from "./ai.schemas";

interface DocumentChunkRow {
    id: number;
    documentId: number;
    content: string;
    chunkIndex: number;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private prisma: PrismaService,
        private readonly aiClient: AiClient,
        private readonly aiQuizChatService: AiQuizChatService,
    ) {}

    async generateQuestions(
        userId: number,
        userPrompt: string,
        documentId?: number | null,
        quizId?: number | null,
    ): Promise<GenerateQuestionsResult> {
        if (!userPrompt?.trim()) {
            throw new BadRequestException("User prompt is required");
        }

        const trimmedPrompt = userPrompt.trim();
        this.logger.log(
            JSON.stringify({
                event: "ai.generateQuestions.start",
                userId,
                hasDocumentId: documentId != null,
                hasQuizId: quizId != null,
                promptLength: trimmedPrompt.length,
            }),
        );

        try {
            if (quizId != null) {
                await this.aiQuizChatService.appendMessage({
                    userId,
                    quizId,
                    role: "user",
                    content: trimmedPrompt,
                    documentId,
                });
            }

            if (documentId != null) {
                this.logger.log(
                    JSON.stringify({
                        event: "ai.generateQuestions.route",
                        mode: "rag",
                        userId,
                        documentId,
                    }),
                );
                const result = await this.generateWithRag(userId, documentId, userPrompt);
                if (quizId != null) {
                    await this.aiQuizChatService.appendMessage({
                        userId,
                        quizId,
                        role: "assistant",
                        content: this.buildAssistantSummary(result, documentId),
                        generatedCount: result.questions.length,
                        generatedQuestions: result.questions,
                    });
                }
                return result;
            }

            this.logger.log(
                JSON.stringify({
                    event: "ai.generateQuestions.route",
                    mode: "freestyle",
                    userId,
                    documentId: null,
                }),
            );

            const validation = await this.validatePrompt(userPrompt);
            if (!validation.valid) {
                const message =
                    validation.reason ?? "Your prompt is unclear or not appropriate for quiz generation.";
                this.logger.warn(
                    JSON.stringify({
                        event: "ai.generateQuestions.prompt_invalid",
                        userId,
                        reason: message,
                    }),
                );
                throw new BadRequestException(message);
            }

            const result = await this.generateFreestyle(userPrompt);
            if (quizId != null) {
                await this.aiQuizChatService.appendMessage({
                    userId,
                    quizId,
                    role: "assistant",
                    content: this.buildAssistantSummary(result, null),
                    generatedCount: result.questions.length,
                    generatedQuestions: result.questions,
                });
            }
            return result;
        } catch (err) {
            this.handleAiError(err);
        }
    }

    private handleAiError(err: unknown): never {
        if (err instanceof BadRequestException || err instanceof ForbiddenException) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.error.client",
                    type: err.constructor.name,
                    message: err.message,
                }),
            );
            throw err;
        }

        const errObj = err as Error & { status?: number; response?: unknown; body?: unknown };

        this.logger.error(
            JSON.stringify({
                event: "ai.error.unexpected",
                message: errObj?.message ?? "unknown",
                status: errObj?.status,
                hasResponse: errObj?.response !== undefined,
                hasBody: errObj?.body !== undefined,
            }),
        );

        const status = errObj?.status;
        const isQuotaError =
            status === 429 ||
            errObj?.message?.includes("RESOURCE_EXHAUSTED") ||
            errObj?.message?.includes("quota");

        if (isQuotaError) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.error.quota",
                    message: errObj?.message ?? "",
                }),
            );
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message:
                        "AI quota exceeded. Please try again later or check your Gemini API plan and billing.",
                    error: "Too Many Requests",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        throw errObj;
    }

    private async validatePrompt(prompt: string): Promise<{ valid: boolean; reason?: string }> {
        const jsonText = await this.aiClient.generateJsonContent({
            systemPrompt: PROMPT_VALIDATION_SYSTEM,
            userMessage: `User request: ${prompt}`,
            responseMimeType: "application/json",
        });

        try {
            const clean = this.cleanJsonText(jsonText);
            const parsed = JSON.parse(clean) as { valid?: boolean; reason?: string };
            return {
                valid: parsed.valid === true,
                reason: parsed.reason,
            };
        } catch {
            return {
                valid: false,
                reason:
                    "I couldn’t understand that request. Try something like “Generate 5 multiple-choice questions about photosynthesis” or “Create a quiz on World War 2”.",
            };
        }
    }

    private async generateWithRag(
        userId: number,
        documentId: number,
        userPrompt: string,
    ): Promise<GenerateQuestionsResult> {
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!doc) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.generateWithRag.document_not_found",
                    documentId,
                    userId,
                }),
            );
            throw new ForbiddenException("Document not found");
        }

        if (doc.status !== DocumentStatus.READY) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.generateWithRag.document_not_ready",
                    documentId,
                    userId,
                    status: doc.status,
                }),
            );
            throw new BadRequestException(
                `Document is not ready for quiz generation (status: ${doc.status}). Wait for indexing to complete.`,
            );
        }

        this.logger.log(
            JSON.stringify({
                event: "ai.generateWithRag.start",
                documentId,
                userId,
            }),
        );

        const embedding = await this.embedQuery(userPrompt);
        const chunks = await this.retrieveChunks(documentId, embedding);
        this.logger.log(
            JSON.stringify({
                event: "ai.generateWithRag.chunks_selected",
                documentId,
                userId,
                chunkCount: chunks.length,
            }),
        );

        const context = chunks.map((c) => c.content).join("\n\n");

        if (!context.trim()) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.generateWithRag.no_context",
                    documentId,
                    userId,
                }),
            );
            throw new BadRequestException(
                "No relevant context found in the document. The document may need to be re-indexed with the same embedding model.",
            );
        }

        const userMessage = `Context from the document:\n\n${context}\n\n---\n\nUser request: ${userPrompt}`;
        const result = await this.generateQuizFromPrompt(SYSTEM_PROMPT_RAG, userMessage);
        this.logger.log(
            JSON.stringify({
                event: "ai.generateWithRag.completed",
                documentId,
                userId,
                questionCount: result.questions.length,
            }),
        );
        return result;
    }

    private async generateFreestyle(userPrompt: string): Promise<GenerateQuestionsResult> {
        this.logger.log(
            JSON.stringify({
                event: "ai.generateFreestyle.start",
            }),
        );
        const result = await this.generateQuizFromPrompt(SYSTEM_PROMPT_FREEFORM, userPrompt);
        this.logger.log(
            JSON.stringify({
                event: "ai.generateFreestyle.completed",
                questionCount: result.questions.length,
            }),
        );
        return result;
    }

    private async generateQuizFromPrompt(
        systemPrompt: string,
        userMessage: string,
    ): Promise<GenerateQuestionsResult> {
        const jsonText = await this.aiClient.generateJsonContent({
            systemPrompt,
            userMessage,
            responseMimeType: "application/json",
            responseSchema: QUIZ_RESPONSE_SCHEMA,
        });
        return this.parseStructuredOutput(jsonText);
    }

    private async embedQuery(text: string): Promise<number[]> {
        const values = await this.aiClient.embedQuery(text);
        if (values.length !== EMBEDDING_DIMENSIONS) {
            throw new Error(
                `Unexpected embedding dimension: ${values.length}, expected ${EMBEDDING_DIMENSIONS}`,
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
            ORDER BY embedding <=> ${vectorStr}::vector
            LIMIT ${limit}
        `;

        return rows;
    }

    private sanitizeQuestionText(text: string): string {
        let t = (text ?? "").trim();
        // Defensive cleanup: some models leak disclaimers into question text.
        t = t.replace(/^note\s*[:\-—]\s*/i, "");
        t = t.replace(/^based on general knowledge\.\s*/i, "");
        return t.trim();
    }

    private parseStructuredOutput(jsonText: string): GenerateQuestionsResult {
        let parsed: { questions?: GeneratedQuestion[]; meta?: unknown };

        try {
            const clean = this.cleanJsonText(jsonText);
            parsed = JSON.parse(clean) as { questions?: GeneratedQuestion[]; meta?: unknown };
        } catch (err) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.parseStructuredOutput.parse_error",
                    message: err instanceof Error ? err.message : String(err),
                }),
            );
            throw new BadRequestException(
                "I couldn’t generate questions from that. Try rephrasing, adding more detail, or specifying the number of questions you want.",
            );
        }

        const questions = parsed?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new BadRequestException(
                "I couldn’t generate any valid questions from that request. Try being more specific about the topic and difficulty.",
            );
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
                text: this.sanitizeQuestionText(q.text),
                options: q.options
                    .filter((o) => o && typeof o.text === "string")
                    .map((o) => ({
                        text: String(o.text).trim(),
                        isCorrect: Boolean(o.isCorrect),
                    })),
            }));

        const rawMeta = parsed?.meta as Record<string, unknown> | undefined;
        const safeMeta = rawMeta && typeof rawMeta === "object" ? rawMeta : undefined;

        return {
            questions: validated,
            meta: safeMeta as GenerateQuestionsResult["meta"] | undefined,
        };
    }

    private buildAssistantSummary(result: GenerateQuestionsResult, documentId: number | null) {
        const note = result.meta?.note?.trim();
        if (note) return note;
        const count = result.questions?.length ?? 0;
        const base =
            count > 0
                ? `Generated ${count} question${count === 1 ? "" : "s"}.`
                : "I couldn't generate any questions from that request.";
        return documentId != null ? `${base} (Using attached document.)` : base;
    }

    private cleanJsonText(text: string): string {
        return text.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    }
}
