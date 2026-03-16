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
import {
    EMBEDDING_DIMENSIONS,
    GENERATION_MODEL,
    PROMPT_VALIDATION_SYSTEM,
    RAG_TOP_K,
    SYSTEM_PROMPT_FREEFORM,
    SYSTEM_PROMPT_RAG,
} from "./ai.constants";
import type { GenerateQuestionsResult, GeneratedQuestion } from "./ai.types";
import { AiClient } from "./ai.client";

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
    ) {}

    async generateQuestions(
        userId: number,
        userPrompt: string,
        documentId?: number | null,
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
                promptLength: trimmedPrompt.length,
            }),
        );

        try {
            if (documentId != null) {
                this.logger.log(
                    JSON.stringify({
                        event: "ai.generateQuestions.route",
                        mode: "rag",
                        userId,
                        documentId,
                    }),
                );
                return await this.generateWithRag(userId, documentId, userPrompt);
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

            return await this.generateFreestyle(userPrompt);
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
            return { valid: true };
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
        const jsonText = await this.aiClient.generateJsonContent({
            systemPrompt: SYSTEM_PROMPT_RAG,
            userMessage,
            responseMimeType: "application/json",
        });
        const result = this.parseStructuredOutput(jsonText);

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

        const jsonText = await this.aiClient.generateJsonContent({
            systemPrompt: SYSTEM_PROMPT_FREEFORM,
            userMessage: userPrompt,
            responseMimeType: "application/json",
        });
        const result = this.parseStructuredOutput(jsonText);

        this.logger.log(
            JSON.stringify({
                event: "ai.generateFreestyle.completed",
                questionCount: result.questions.length,
            }),
        );

        return result;
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

    private parseStructuredOutput(jsonText: string): GenerateQuestionsResult {
        let parsed: { questions?: GeneratedQuestion[] };

        try {
            const clean = this.cleanJsonText(jsonText);
            parsed = JSON.parse(clean) as { questions?: GeneratedQuestion[] };
        } catch (err) {
            this.logger.warn(
                JSON.stringify({
                    event: "ai.parseStructuredOutput.parse_error",
                    message: err instanceof Error ? err.message : String(err),
                }),
            );
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
                        text: String(o.text).trim(),
                        isCorrect: Boolean(o.isCorrect),
                    })),
            }));

        return { questions: validated };
    }

    private cleanJsonText(text: string): string {
        return text.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    }
}
