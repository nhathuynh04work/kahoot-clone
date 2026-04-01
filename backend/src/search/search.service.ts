import { Injectable } from "@nestjs/common";
import { LobbyStatus, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

type SearchArgs = { q: string; limit: number };

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) {}

    async searchAll(args: SearchArgs) {
        const q = args.q.trim();
        const limit = Math.min(10, Math.max(1, args.limit));

        const [quizzes, documents, users] = await Promise.all([
            this.searchPublicQuizzes({ q, limit }),
            this.searchPublicDocuments({ q, limit }),
            this.searchUsers({ q, limit }),
        ]);

        return { quizzes, documents, users };
    }

    private async searchPublicQuizzes(args: SearchArgs) {
        const where: Prisma.QuizWhereInput = {
            visibility: "PUBLIC",
            title: { contains: args.q, mode: "insensitive" },
        };

        const quizzes = await this.prisma.quiz.findMany({
            where,
            take: args.limit,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            select: {
                id: true,
                title: true,
                coverUrl: true,
                userId: true,
                createdAt: true,
                _count: { select: { questions: true } },
                user: { select: { name: true, email: true } },
            },
        });

        const quizIds = quizzes.map((q) => q.id);
        const [saveCounts, playCounts] = await Promise.all([
            this.getQuizSaveCounts(quizIds),
            this.getQuizPlayCounts(quizIds),
        ]);

        return quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            coverUrl: quiz.coverUrl,
            userId: quiz.userId,
            authorName: quiz.user?.name ?? quiz.user?.email ?? null,
            questionCount: quiz._count.questions,
            saveCount: saveCounts.get(quiz.id) ?? 0,
            playCount: playCounts.get(quiz.id) ?? 0,
        }));
    }

    private async searchPublicDocuments(args: SearchArgs) {
        const where: Prisma.DocumentWhereInput = {
            visibility: "PUBLIC",
            fileName: { contains: args.q, mode: "insensitive" },
        };

        const docs = await this.prisma.document.findMany({
            where,
            take: args.limit,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            select: {
                id: true,
                fileName: true,
                fileSize: true,
                userId: true,
                status: true,
                createdAt: true,
                user: { select: { name: true, email: true } },
            },
        });

        const ids = docs.map((d) => d.id);
        const saveCounts = await this.getDocumentSaveCounts(ids);

        return docs.map((doc) => ({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            userId: doc.userId,
            status: doc.status,
            authorName: doc.user?.name ?? doc.user?.email ?? null,
            saveCount: saveCounts.get(doc.id) ?? 0,
        }));
    }

    private async searchUsers(args: SearchArgs) {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: args.q, mode: "insensitive" } },
                    { email: { contains: args.q, mode: "insensitive" } },
                ],
            },
            take: args.limit,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            },
        });

        return users.map((u) => ({
            id: u.id,
            name: u.name ?? null,
            avatarUrl: u.avatarUrl ?? null,
        }));
    }

    private async getQuizSaveCounts(quizIds: number[]): Promise<Map<number, number>> {
        if (quizIds.length === 0) return new Map();
        const rows = await this.prisma.quizSave.groupBy({
            by: ["quizId"],
            where: { quizId: { in: quizIds } },
            _count: { _all: true },
        });
        return new Map(rows.map((r) => [r.quizId, r._count._all]));
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

    private async getDocumentSaveCounts(documentIds: number[]): Promise<Map<number, number>> {
        if (documentIds.length === 0) return new Map();
        const rows = await this.prisma.documentSave.groupBy({
            by: ["documentId"],
            where: { documentId: { in: documentIds } },
            _count: { _all: true },
        });
        return new Map(rows.map((r) => [r.documentId, r._count._all]));
    }
}

