import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { AiChatRole, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { GeneratedQuestion } from "./ai.types.js";

const MAX_CHAT_MESSAGES = 50;

type GeneratedQuestionsPayload = GeneratedQuestion[];

@Injectable()
export class AiQuizChatService {
    constructor(private prisma: PrismaService) {}

    private async assertQuizOwnedByUser(userId: number, quizId: number) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) throw new NotFoundException("Quiz not found");
        if (quiz.userId !== userId) throw new ForbiddenException("Not allowed to access this quiz");
    }

    async getMessages(userId: number, quizId: number, limit: number = MAX_CHAT_MESSAGES) {
        await this.assertQuizOwnedByUser(userId, quizId);

        const session = await this.prisma.aiQuizChatSession.findUnique({
            where: { quizId },
        });
        if (!session) return [];

        const messages = await this.prisma.aiQuizChatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: "asc" },
            take: limit,
            include: {
                document: { select: { id: true, fileName: true } },
            },
        });

        return messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
            generatedCount: m.generatedCount ?? undefined,
            generatedQuestions: (m.generatedQuestions as GeneratedQuestionsPayload | null) ?? undefined,
            attachedDocument: m.document ? { id: m.document.id, fileName: m.document.fileName } : undefined,
        }));
    }

    async appendMessage({
        userId,
        quizId,
        role,
        content,
        documentId,
        generatedCount,
        generatedQuestions,
    }: {
        userId: number;
        quizId: number;
        role: AiChatRole;
        content: string;
        documentId?: number | null;
        generatedCount?: number | null;
        generatedQuestions?: GeneratedQuestionsPayload | null;
    }) {
        await this.assertQuizOwnedByUser(userId, quizId);

        const trimmed = content.trim();
        if (!trimmed) return;

        await this.prisma.$transaction(async (tx) => {
            const session = await tx.aiQuizChatSession.upsert({
                where: { quizId },
                update: { lastActivityAt: new Date() },
                create: { quizId },
                select: { id: true },
            });

            await tx.aiQuizChatMessage.create({
                data: {
                    sessionId: session.id,
                    role,
                    content: trimmed,
                    documentId: documentId ?? null,
                    generatedCount: generatedCount ?? null,
                    generatedQuestions: generatedQuestions
                        ? (generatedQuestions as unknown as Prisma.InputJsonValue)
                        : undefined,
                },
            });

            const all = await tx.aiQuizChatMessage.findMany({
                where: { sessionId: session.id },
                orderBy: { createdAt: "asc" },
                select: { id: true },
            });

            if (all.length > MAX_CHAT_MESSAGES) {
                const toDelete = all.slice(0, all.length - MAX_CHAT_MESSAGES).map((m) => m.id);
                await tx.aiQuizChatMessage.deleteMany({ where: { id: { in: toDelete } } });
            }
        });
    }
}

