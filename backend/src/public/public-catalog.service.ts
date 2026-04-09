import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, LobbyStatus, SaveTargetType } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { attachClientOptions } from "../quiz/question-payload.js";

type ExploreMode = "recent" | "mostPlayed" | "mostSaved";

function normalizeMode(mode: string | undefined): ExploreMode {
    switch (mode) {
        case "mostPlayed":
        case "mostSaved":
        case "recent":
            return mode;
        default:
            return "recent";
    }
}

@Injectable()
export class PublicCatalogService {
    constructor(private prisma: PrismaService) {}

    async getPublicQuizzes(options: {
        mode: string;
        q?: string;
        page: number;
        pageSize: number;
    }) {
        const mode = normalizeMode(options.mode);
        const q = (options.q ?? "").trim();
        const page = Math.max(1, options.page);
        const pageSize = Math.min(200, Math.max(1, options.pageSize));

        const baseWhere: Prisma.QuizWhereInput = {
            visibility: "PUBLIC",
            ...(q
                ? {
                      title: {
                          contains: q,
                          mode: "insensitive",
                      },
                  }
                : {}),
        };

        const totalItems = await this.prisma.quiz.count({
            where: baseWhere,
        });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        if (mode === "recent") {
            const quizzes = await this.prisma.quiz.findMany({
                where: baseWhere,
                include: {
                    questions: true,
                    user: { select: { name: true, email: true } },
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip,
                take: pageSize,
            });

            const quizIds = quizzes.map((q) => q.id);
            const [saveCounts, playCounts] = await Promise.all([
                this.getQuizSaveCounts(quizIds),
                this.getQuizPlayCounts(quizIds),
            ]);

            const items = quizzes.map((quiz) => {
                const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
                const { user: _user, ...rest } = quiz;
                return {
                    ...rest,
                    authorName,
                    saveCount: saveCounts.get(quiz.id) ?? 0,
                    playCount: playCounts.get(quiz.id) ?? 0,
                };
            });

            return { items, page: safePage, pageSize, totalItems, totalPages };
        }

        const publicQuizIds = await this.prisma.quiz.findMany({
            where: baseWhere,
            select: { id: true },
        });
        const allIds = publicQuizIds.map((r) => r.id);

        const counts =
            mode === "mostSaved"
                ? await this.getQuizSaveCounts(allIds)
                : await this.getQuizPlayCounts(allIds);

        // Stable tie-breaker for deterministic ordering.
        const ordered = allIds
            .map((id) => ({ id, count: counts.get(id) ?? 0 }))
            .sort((a, b) => b.count - a.count || b.id - a.id);

        const pageIds = ordered.slice(skip, skip + pageSize).map((x) => x.id);
        if (pageIds.length === 0) {
            return { items: [], page: safePage, pageSize, totalItems, totalPages };
        }

        const quizzes = await this.prisma.quiz.findMany({
            where: { id: { in: pageIds } },
            include: {
                questions: true,
                user: { select: { name: true, email: true } },
            },
        });

        const quizById = new Map(quizzes.map((q) => [q.id, q]));
        const quizIdsForPage = pageIds;
        const [saveCounts, playCounts] = await Promise.all([
            this.getQuizSaveCounts(quizIdsForPage),
            this.getQuizPlayCounts(quizIdsForPage),
        ]);

        const items = quizIdsForPage
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

        return { items, page: safePage, pageSize, totalItems, totalPages };
    }

    async getPublicQuizzesByUserId(
        userId: number,
        options: { mode: string; page: number; pageSize: number },
    ) {
        const mode = normalizeMode(options.mode);
        const page = Math.max(1, options.page);
        const pageSize = Math.min(200, Math.max(1, options.pageSize));

        const totalItems = await this.prisma.quiz.count({
            where: { userId, visibility: "PUBLIC" },
        });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        const baseWhere: Prisma.QuizWhereInput = {
            userId,
            visibility: "PUBLIC",
        };

        const fetchWithOrder = async (ids: number[]) => {
            const quizzes = await this.prisma.quiz.findMany({
                where: { id: { in: ids } },
                include: {
                    questions: true,
                    user: { select: { name: true, email: true } },
                },
            });
            const quizById = new Map(quizzes.map((q) => [q.id, q]));
            const [saveCounts, playCounts] = await Promise.all([
                this.getQuizSaveCounts(ids),
                this.getQuizPlayCounts(ids),
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
        };

        if (mode === "recent") {
            const quizzes = await this.prisma.quiz.findMany({
                where: baseWhere,
                include: {
                    questions: true,
                    user: { select: { name: true, email: true } },
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip,
                take: pageSize,
            });

            const quizIds = quizzes.map((q) => q.id);
            const [saveCounts, playCounts] = await Promise.all([
                this.getQuizSaveCounts(quizIds),
                this.getQuizPlayCounts(quizIds),
            ]);

            const items = quizzes.map((quiz) => {
                const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
                const { user: _user, ...rest } = quiz;
                return {
                    ...rest,
                    authorName,
                    saveCount: saveCounts.get(quiz.id) ?? 0,
                    playCount: playCounts.get(quiz.id) ?? 0,
                };
            });

            return { items, page: safePage, pageSize, totalItems, totalPages };
        }

        const publicIds = await this.prisma.quiz.findMany({
            where: baseWhere,
            select: { id: true },
        });
        const allIds = publicIds.map((r) => r.id);

        const counts =
            mode === "mostSaved"
                ? await this.getQuizSaveCounts(allIds)
                : await this.getQuizPlayCounts(allIds);

        const ordered = allIds
            .map((id) => ({ id, count: counts.get(id) ?? 0 }))
            .sort((a, b) => b.count - a.count || b.id - a.id);

        const pageIds = ordered.slice(skip, skip + pageSize).map((x) => x.id);
        return {
            items: await fetchWithOrder(pageIds),
            page: safePage,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getPublicQuizDetails(quizId: number) {
        const quiz = await this.prisma.quiz.findFirst({
            where: { id: quizId, visibility: "PUBLIC" },
            include: {
                user: { select: { name: true, email: true } },
                questions: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!quiz) throw new NotFoundException("Quiz not found");

        const [saveCountRows, playCountRows] = await Promise.all([
            this.prisma.save.groupBy({
                by: ["targetId"],
                where: { targetType: SaveTargetType.QUIZ, targetId: quizId },
                _count: { _all: true },
            }),
            this.prisma.gameLobby.groupBy({
                by: ["quizId"],
                where: {
                    quizId,
                    status: LobbyStatus.CLOSED,
                    report: { isNot: null },
                },
                _count: { _all: true },
            }),
        ]);

        const saveCount = saveCountRows[0]?._count._all ?? 0;
        const playCount = playCountRows[0]?._count._all ?? 0;

        const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
        const { user: _user, questions: rawQuestions, ...rest } = quiz;

        return {
            ...rest,
            questions: rawQuestions.map((q) => attachClientOptions(q)),
            authorName,
            saveCount,
            playCount,
        };
    }

    async getPublicDocuments(options: {
        mode: string;
        q?: string;
        page: number;
        pageSize: number;
    }) {
        const mode = normalizeMode(options.mode);
        const q = (options.q ?? "").trim();
        const page = Math.max(1, options.page);
        const pageSize = Math.min(200, Math.max(1, options.pageSize));

        const baseWhere: Prisma.DocumentWhereInput = {
            visibility: "PUBLIC",
            ...(q
                ? {
                      fileName: {
                          contains: q,
                          mode: "insensitive",
                      },
                  }
                : {}),
        };

        const totalItems = await this.prisma.document.count({
            where: baseWhere,
        });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        // Documents don’t have “played”, so only recent/mostSaved make sense.
        const effectiveMode: ExploreMode = mode === "mostPlayed" ? "recent" : mode;

        if (effectiveMode === "recent") {
            const docs = await this.prisma.document.findMany({
                where: baseWhere,
                include: { user: { select: { name: true, email: true } } },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip,
                take: pageSize,
            });

            const documentIds = docs.map((d) => d.id);
            const saveCounts = await this.getDocumentSaveCounts(documentIds);
            const items = docs.map((doc) => {
                const authorName = doc.user?.name ?? doc.user?.email ?? null;
                const { user: _user, ...rest } = doc;
                return {
                    ...rest,
                    authorName,
                    saveCount: saveCounts.get(doc.id) ?? 0,
                };
            });
            return { items, page: safePage, pageSize, totalItems, totalPages };
        }

        const publicIds = await this.prisma.document.findMany({
            where: baseWhere,
            select: { id: true },
        });
        const allIds = publicIds.map((r) => r.id);
        const saveCounts = await this.getDocumentSaveCounts(allIds);

        const ordered = allIds
            .map((id) => ({ id, count: saveCounts.get(id) ?? 0 }))
            .sort((a, b) => b.count - a.count || b.id - a.id);

        const pageIds = ordered.slice(skip, skip + pageSize).map((x) => x.id);
        const docs = await this.prisma.document.findMany({
            where: { id: { in: pageIds } },
            include: { user: { select: { name: true, email: true } } },
        });
        const docsById = new Map(docs.map((d) => [d.id, d]));

        const items = pageIds
            .map((id) => {
                const doc = docsById.get(id);
                if (!doc) return null;
                const authorName = doc.user?.name ?? doc.user?.email ?? null;
                const { user: _user, ...rest } = doc;
                return { ...rest, authorName, saveCount: saveCounts.get(id) ?? 0 };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);

        return { items, page: safePage, pageSize, totalItems, totalPages };
    }

    async getPublicDocumentsByUserId(
        userId: number,
        options: { mode: string; page: number; pageSize: number },
    ) {
        const mode = normalizeMode(options.mode);
        const page = Math.max(1, options.page);
        const pageSize = Math.min(200, Math.max(1, options.pageSize));

        const totalItems = await this.prisma.document.count({
            where: { userId, visibility: "PUBLIC" },
        });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        const effectiveMode: ExploreMode = mode === "mostPlayed" ? "recent" : mode;

        if (effectiveMode === "recent") {
            const docs = await this.prisma.document.findMany({
                where: { userId, visibility: "PUBLIC" },
                include: { user: { select: { name: true, email: true } } },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip,
                take: pageSize,
            });

            const ids = docs.map((d) => d.id);
            const saveCounts = await this.getDocumentSaveCounts(ids);
            return {
                items: docs.map((doc) => {
                    const authorName = doc.user?.name ?? doc.user?.email ?? null;
                    const { user: _user, ...rest } = doc;
                    return { ...rest, authorName, saveCount: saveCounts.get(doc.id) ?? 0 };
                }),
                page: safePage,
                pageSize,
                totalItems,
                totalPages,
            };
        }

        const publicIds = await this.prisma.document.findMany({
            where: { userId, visibility: "PUBLIC" },
            select: { id: true },
        });
        const allIds = publicIds.map((r) => r.id);
        const saveCounts = await this.getDocumentSaveCounts(allIds);

        const ordered = allIds
            .map((id) => ({ id, count: saveCounts.get(id) ?? 0 }))
            .sort((a, b) => b.count - a.count || b.id - a.id);

        const pageIds = ordered.slice(skip, skip + pageSize).map((x) => x.id);
        const docs = await this.prisma.document.findMany({
            where: { id: { in: pageIds } },
            include: { user: { select: { name: true, email: true } } },
        });
        const docsById = new Map(docs.map((d) => [d.id, d]));

        return {
            items: pageIds
                .map((id) => {
                    const doc = docsById.get(id);
                    if (!doc) return null;
                    const authorName = doc.user?.name ?? doc.user?.email ?? null;
                    const { user: _user, ...rest } = doc;
                    return { ...rest, authorName, saveCount: saveCounts.get(id) ?? 0 };
                })
                .filter((x): x is NonNullable<typeof x> => x !== null),
            page: safePage,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    private async getQuizSaveCounts(quizIds: number[]): Promise<Map<number, number>> {
        if (quizIds.length === 0) return new Map();

        const rows = await this.prisma.save.groupBy({
            by: ["targetId"],
            where: { targetType: SaveTargetType.QUIZ, targetId: { in: quizIds } },
            _count: { _all: true },
        });
        return new Map(rows.map((r) => [r.targetId, r._count._all]));
    }

    private async getDocumentSaveCounts(documentIds: number[]): Promise<Map<number, number>> {
        if (documentIds.length === 0) return new Map();

        const rows = await this.prisma.save.groupBy({
            by: ["targetId"],
            where: { targetType: SaveTargetType.DOCUMENT, targetId: { in: documentIds } },
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
}

