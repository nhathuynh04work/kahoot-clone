import { ForbiddenException, Injectable } from "@nestjs/common";
import { LobbyStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class SavesService {
    constructor(private prisma: PrismaService) {}

    async toggleQuizSave(userId: number, quizId: number) {
        // Ensure the quiz exists to avoid returning “saved” for invalid ids.
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) throw new ForbiddenException("Quiz not found");

        const where = { userId_quizId: { userId, quizId } };
        const existing = await this.prisma.quizSave.findUnique({ where });

        if (existing) {
            await this.prisma.quizSave.delete({ where });
            return { saved: false, quizId };
        }

        await this.prisma.quizSave.create({
            data: { userId, quizId },
        });
        return { saved: true, quizId };
    }

    async toggleDocumentSave(userId: number, documentId: number) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) throw new ForbiddenException("Document not found");

        const where = { userId_documentId: { userId, documentId } };
        const existing = await this.prisma.documentSave.findUnique({ where });

        if (existing) {
            await this.prisma.documentSave.delete({ where });
            return { saved: false, documentId };
        }

        await this.prisma.documentSave.create({
            data: { userId, documentId },
        });
        return { saved: true, documentId };
    }

    async getMySavedQuizIds(userId: number): Promise<number[]> {
        const rows = await this.prisma.quizSave.findMany({
            where: { userId },
            select: { quizId: true },
        });
        return rows.map((r) => r.quizId);
    }

    async getMySavedDocumentIds(userId: number): Promise<number[]> {
        const rows = await this.prisma.documentSave.findMany({
            where: { userId },
            select: { documentId: true },
        });
        return rows.map((r) => r.documentId);
    }

    async getMySavedPublicQuizzes(userId: number) {
        const rows = await this.prisma.quizSave.findMany({
            where: { userId, quiz: { visibility: "PUBLIC" } },
            select: {
                quiz: {
                    include: {
                        questions: true,
                        user: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const quizzes = rows.map((r) => r.quiz);
        const quizIds = quizzes.map((q) => q.id);
        const [saveCounts, playCounts] = await Promise.all([
            this.getQuizSaveCounts(quizIds),
            this.getQuizPlayCounts(quizIds),
        ]);

        return quizzes.map((quiz) => {
            const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
            const { user: _user, ...rest } = quiz;
            return {
                ...rest,
                authorName,
                saveCount: saveCounts.get(quiz.id) ?? 0,
                playCount: playCounts.get(quiz.id) ?? 0,
            };
        });
    }

    async getMySavedPublicDocuments(userId: number) {
        const rows = await this.prisma.documentSave.findMany({
            where: { userId, document: { visibility: "PUBLIC" } },
            select: {
                document: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const docs = rows.map((r) => r.document);
        const documentIds = docs.map((d) => d.id);
        const saveCounts = await this.getDocumentSaveCounts(documentIds);

        return docs.map((doc) => {
            const authorName = doc.user?.name ?? doc.user?.email ?? null;
            const { user: _user, ...rest } = doc as any;
            return {
                ...rest,
                authorName,
                saveCount: saveCounts.get(doc.id) ?? 0,
            };
        });
    }

    async getQuizSaveCounts(quizIds: number[]): Promise<Map<number, number>> {
        if (quizIds.length === 0) return new Map();

        const rows = await this.prisma.quizSave.groupBy({
            by: ["quizId"],
            where: { quizId: { in: quizIds } },
            _count: { _all: true },
        });

        return new Map(rows.map((r) => [r.quizId, r._count._all]));
    }

    async getDocumentSaveCounts(documentIds: number[]): Promise<Map<number, number>> {
        if (documentIds.length === 0) return new Map();

        const rows = await this.prisma.documentSave.groupBy({
            by: ["documentId"],
            where: { documentId: { in: documentIds } },
            _count: { _all: true },
        });

        return new Map(rows.map((r) => [r.documentId, r._count._all]));
    }

    private async getQuizPlayCounts(quizIds: number[]): Promise<Map<number, number>> {
        if (quizIds.length === 0) return new Map();

        const rows = await this.prisma.gameLobby.groupBy({
            by: ["quizId"],
            where: {
                quizId: { in: quizIds },
                status: LobbyStatus.CLOSED,
                report: { isNot: null },
            },
            _count: { _all: true },
        });

        return new Map(rows.map((r) => [r.quizId, r._count._all]));
    }
}

