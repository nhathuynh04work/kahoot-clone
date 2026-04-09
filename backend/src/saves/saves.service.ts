import { ForbiddenException, Injectable } from "@nestjs/common";
import { LobbyStatus, SaveTargetType } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class SavesService {
    constructor(private prisma: PrismaService) {}

    async toggleSave(userId: number, targetType: SaveTargetType, targetId: number) {
        await this.assertTargetExists(targetType, targetId);

        const where = { userId_targetType_targetId: { userId, targetType, targetId } };
        const existing = await this.prisma.save.findUnique({ where });

        if (existing) {
            await this.prisma.save.delete({ where });
            return { saved: false, targetType, targetId };
        }

        await this.prisma.save.create({
            data: { userId, targetType, targetId },
        });
        return { saved: true, targetType, targetId };
    }

    async getMySavedTargetIds(userId: number, targetType: SaveTargetType): Promise<number[]> {
        const rows = await this.prisma.save.findMany({
            where: { userId, targetType },
            select: { targetId: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return rows.map((r) => r.targetId);
    }

    async getMySavedPublicTargets(userId: number, targetType: SaveTargetType) {
        const saves = await this.prisma.save.findMany({
            where: { userId, targetType },
            select: { targetId: true, createdAt: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });

        const ids = saves.map((s) => s.targetId);
        if (ids.length === 0) return [];

        if (targetType === SaveTargetType.QUIZ) {
            const quizzes = await this.prisma.quiz.findMany({
                where: { id: { in: ids }, visibility: "PUBLIC" },
                include: { questions: true, user: { select: { name: true, email: true } } },
            });
            const quizById = new Map(quizzes.map((q) => [q.id, q]));
            const quizIds = quizzes.map((q) => q.id);
            const [saveCounts, playCounts] = await Promise.all([
                this.getSaveCounts(SaveTargetType.QUIZ, quizIds),
                this.getQuizPlayCounts(quizIds),
            ]);

            return ids
                .map((id) => {
                    const quiz = quizById.get(id);
                    if (!quiz) return null;
                    const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
                    const { user: _user, ...rest } = quiz;
                    return {
                        ...rest,
                        authorName,
                        saveCount: saveCounts.get(id) ?? 0,
                        playCount: playCounts.get(id) ?? 0,
                    };
                })
                .filter((x): x is NonNullable<typeof x> => x !== null);
        }

        const documents = await this.prisma.document.findMany({
            where: { id: { in: ids }, visibility: "PUBLIC" },
            include: { user: { select: { name: true, email: true } } },
        });
        const docById = new Map(documents.map((d) => [d.id, d]));
        const docIds = documents.map((d) => d.id);
        const saveCounts = await this.getSaveCounts(SaveTargetType.DOCUMENT, docIds);

        return ids
            .map((id) => {
                const doc = docById.get(id);
                if (!doc) return null;
                const authorName = doc.user?.name ?? doc.user?.email ?? null;
                const { user: _user, ...rest } = doc as any;
                return {
                    ...rest,
                    authorName,
                    saveCount: saveCounts.get(id) ?? 0,
                };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);
    }

    async getSaveCounts(
        targetType: SaveTargetType,
        targetIds: number[],
    ): Promise<Map<number, number>> {
        if (targetIds.length === 0) return new Map();

        const rows = await this.prisma.save.groupBy({
            by: ["targetId"],
            where: { targetType, targetId: { in: targetIds } },
            _count: { _all: true },
        });

        return new Map(rows.map((r) => [r.targetId, r._count._all]));
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

    private async assertTargetExists(targetType: SaveTargetType, targetId: number) {
        if (targetType === SaveTargetType.QUIZ) {
            const quiz = await this.prisma.quiz.findUnique({ where: { id: targetId } });
            if (!quiz) throw new ForbiddenException("Quiz not found");
            return;
        }

        if (targetType === SaveTargetType.DOCUMENT) {
            const doc = await this.prisma.document.findUnique({ where: { id: targetId } });
            if (!doc) throw new ForbiddenException("Document not found");
            return;
        }

        // Exhaustive check (should be unreachable with ParseEnumPipe).
        throw new ForbiddenException("Invalid save target type");
    }
}

