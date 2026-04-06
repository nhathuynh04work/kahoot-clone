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
    quizAccountTierAppendix,
    RAG_TOP_K,
    SYSTEM_PROMPT_FREEFORM,
    SYSTEM_PROMPT_RAG,
} from "./ai.constants";
import type {
    GenerateQuestionsResult,
    GeneratedQuestion,
    GeneratedQuestionType,
} from "./ai.types";
import { EntitlementService } from "../entitlements/entitlement.service.js";
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
        private readonly entitlementService: EntitlementService,
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

            const result = await this.generateFreestyle(userId, userPrompt);
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
            where: {
                id: documentId,
                OR: [
                    // Owned document
                    { userId },
                    // Saved public document
                    {
                        visibility: "PUBLIC",
                        saves: { some: { userId } },
                    },
                ],
            },
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
        const { isVip } = await this.entitlementService.getVipStatus(userId);
        const systemPrompt = `${SYSTEM_PROMPT_RAG}\n${quizAccountTierAppendix(isVip)}`;
        const result = await this.generateQuizFromPrompt(systemPrompt, userMessage, isVip);
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

    private async generateFreestyle(
        userId: number,
        userPrompt: string,
    ): Promise<GenerateQuestionsResult> {
        this.logger.log(
            JSON.stringify({
                event: "ai.generateFreestyle.start",
            }),
        );
        const { isVip } = await this.entitlementService.getVipStatus(userId);
        const systemPrompt = `${SYSTEM_PROMPT_FREEFORM}\n${quizAccountTierAppendix(isVip)}`;
        const result = await this.generateQuizFromPrompt(systemPrompt, userPrompt, isVip);
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
        isVip: boolean,
    ): Promise<GenerateQuestionsResult> {
        const jsonText = await this.aiClient.generateJsonContent({
            systemPrompt,
            userMessage,
            responseMimeType: "application/json",
            responseSchema: QUIZ_RESPONSE_SCHEMA,
        });
        return this.parseStructuredOutput(jsonText, isVip);
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

    private inferQuestionType(
        o: Record<string, unknown>,
        isVip: boolean,
    ): GeneratedQuestionType {
        const raw = o.type;
        if (typeof raw === "string") {
            const u = raw.toUpperCase().replace(/-/g, "_");
            if (
                u === "SHORT_ANSWER" ||
                u === "NUMBER_INPUT" ||
                u === "MULTIPLE_CHOICE" ||
                u === "TRUE_FALSE"
            ) {
                return u as GeneratedQuestionType;
            }
        }
        if (Array.isArray(o.options)) return "MULTIPLE_CHOICE";
        if (typeof o.correctIsTrue === "boolean") return "TRUE_FALSE";
        if (isVip && typeof o.correctText === "string") return "SHORT_ANSWER";
        if (
            isVip &&
            typeof o.correctNumber === "number" &&
            typeof o.rangeProximity === "number" &&
            Number.isFinite(o.correctNumber) &&
            Number.isFinite(o.rangeProximity)
        ) {
            return "NUMBER_INPUT";
        }
        return "MULTIPLE_CHOICE";
    }

    private normalizeOneQuestion(
        raw: unknown,
        isVip: boolean,
    ): GeneratedQuestion | null {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const o = raw as Record<string, unknown>;
        const text = this.sanitizeQuestionText(String(o.text ?? ""));
        if (!text) return null;

        const type = this.inferQuestionType(o, isVip);
        if ((type === "SHORT_ANSWER" || type === "NUMBER_INPUT") && !isVip) {
            return null;
        }

        if (type === "TRUE_FALSE") {
            const correctIsTrue =
                typeof o.correctIsTrue === "boolean" ? o.correctIsTrue : true;
            return { type: "TRUE_FALSE", text, correctIsTrue };
        }

        if (type === "MULTIPLE_CHOICE") {
            if (!Array.isArray(o.options)) return null;
            const opts = o.options
                .filter((x) => x && typeof x === "object" && typeof (x as { text?: unknown }).text === "string")
                .map((x) => {
                    const r = x as { text: string; isCorrect?: unknown };
                    return {
                        text: String(r.text).trim(),
                        isCorrect: Boolean(r.isCorrect),
                    };
                });
            if (opts.length < 2 || opts.length > 4) return null;
            const correctCount = opts.filter((x) => x.isCorrect).length;
            if (correctCount < 1 || correctCount > opts.length) return null;
            return {
                type: "MULTIPLE_CHOICE",
                text,
                options: opts,
                onlyOneCorrect: correctCount === 1,
            };
        }

        if (type === "SHORT_ANSWER") {
            const correctText = String(o.correctText ?? "").trim();
            if (!correctText) return null;
            return { type: "SHORT_ANSWER", text, correctText };
        }

        const correctNumber = Number(o.correctNumber);
        const rangeProximity = Number(o.rangeProximity);
        if (!Number.isFinite(correctNumber) || !Number.isFinite(rangeProximity)) return null;
        if (rangeProximity < 0) return null;
        return {
            type: "NUMBER_INPUT",
            text,
            correctNumber,
            rangeProximity,
        };
    }

    private parseStructuredOutput(jsonText: string, isVip: boolean): GenerateQuestionsResult {
        let parsed: { questions?: unknown[]; meta?: unknown };

        try {
            const clean = this.cleanJsonText(jsonText);
            parsed = JSON.parse(clean) as { questions?: unknown[]; meta?: unknown };
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

        const rawList = parsed?.questions;
        if (!Array.isArray(rawList) || rawList.length === 0) {
            throw new BadRequestException(
                "I couldn’t generate any valid questions from that request. Try being more specific about the topic and difficulty.",
            );
        }

        const validated: GeneratedQuestion[] = [];
        for (const item of rawList) {
            const q = this.normalizeOneQuestion(item, isVip);
            if (q) validated.push(q);
        }

        if (validated.length === 0) {
            throw new BadRequestException(
                "I couldn’t generate any valid questions from that request. Try being more specific about the topic and difficulty.",
            );
        }

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
