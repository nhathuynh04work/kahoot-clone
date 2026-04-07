import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, UserRole } from "../generated/prisma/client.js";

type DashboardTotals = {
    users: number;
    quizzes: number;
    documents: number;
};

type GrowthPoint = { date: string; count: number };
type TopQuizPoint = { quizId: number; title: string; sessions: number };
type TopSavedQuizPoint = { quizId: number; title: string; saves: number };
type TopSavedDocumentPoint = { documentId: number; fileName: string; saves: number };
type RevenuePoint = { date: string; amountCents: number };
type DonutSlice = { label: string; count: number };

export type AdminDashboardStatsResponse = {
    totals: DashboardTotals & {
        revenueCentsAllTime: number;
        activeSubscriptions: number;
    };
    charts: {
        userGrowth: GrowthPoint[];
        quizGrowth: GrowthPoint[];
        sessionsPlayed: GrowthPoint[];
        topQuizzes: TopQuizPoint[];
        topSavedQuizzes: TopSavedQuizPoint[];
        topSavedDocuments: TopSavedDocumentPoint[];
        vipBreakdown: DonutSlice[];
        planBreakdown: DonutSlice[];
        revenueByDay: RevenuePoint[];
    };
};

export type AdminUserListItem = {
    id: number;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
    isBlocked: boolean;
    createdAt: string;
};

export type AdminUserListResponse = {
    items: AdminUserListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type AdminQuizListItem = {
    id: number;
    title: string;
    visibility: "PUBLIC" | "PRIVATE";
    createdAt: string;
    authorEmail: string;
    savesCount: number;
};

export type AdminQuizListResponse = {
    items: AdminQuizListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type AdminDocumentListItem = {
    id: number;
    fileName: string;
    status: "UPLOADED" | "PARSING" | "READY" | "ERROR";
    visibility: "PUBLIC" | "PRIVATE";
    fileSize: number;
    createdAt: string;
    authorEmail: string;
    savesCount: number;
};

export type AdminDocumentListResponse = {
    items: AdminDocumentListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type AdminSessionListItem = {
    id: number;
    pin: string;
    status: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
    createdAt: string;
    endedAt: string | null;
    quizId: number;
    quizTitle: string;
    hostEmail: string;
    totalPlayers: number | null;
};

export type AdminSessionListResponse = {
    items: AdminSessionListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type AdminRevenueLedgerItem = {
    id: number;
    stripeInvoiceId: string;
    amountCents: number;
    currency: string;
    occurredAt: string;
    userEmail: string | null;
};

export type AdminRevenueSubscriptionItem = {
    id: number;
    userEmail: string;
    status: string;
    stripePriceId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AdminRevenuePageResponse = {
    ledger: {
        items: AdminRevenueLedgerItem[];
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    recentSubscriptions: AdminRevenueSubscriptionItem[];
};

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

    private formatDay(value: unknown): string {
        if (value instanceof Date) return value.toISOString().slice(0, 10);
        if (typeof value === "string") return value.slice(0, 10);
        return String(value);
    }

    async getDashboardStats(options?: { rangeDays?: number }): Promise<AdminDashboardStatsResponse> {
        const rangeDays = options?.rangeDays ?? 30;

        const [usersTotal, quizzesTotal, documentsTotal] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.quiz.count(),
            this.prisma.document.count(),
        ]);

        const [userGrowthRows, quizGrowthRows, sessionsPlayedRows] = await Promise.all([
            this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
                SELECT
                    date_trunc('day', "createdAt") AS day,
                    COUNT(*)::bigint AS count
                FROM "User"
                WHERE "createdAt" >= NOW() - (${rangeDays} * INTERVAL '1 day')
                GROUP BY day
                ORDER BY day ASC
            `,
            this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
                SELECT
                    date_trunc('day', "createdAt") AS day,
                    COUNT(*)::bigint AS count
                FROM "Quiz"
                WHERE "createdAt" >= NOW() - (${rangeDays} * INTERVAL '1 day')
                GROUP BY day
                ORDER BY day ASC
            `,
            this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
                SELECT
                    date_trunc('day', l."endedAt") AS day,
                    COUNT(*)::bigint AS count
                FROM "GameLobby" l
                JOIN "GameLobbyReport" r ON r."lobbyId" = l."id"
                WHERE
                    l."status" = 'CLOSED'
                    AND l."endedAt" IS NOT NULL
                    AND l."endedAt" >= NOW() - (${rangeDays} * INTERVAL '1 day')
                GROUP BY day
                ORDER BY day ASC
            `,
        ]);

        const now = new Date();

        const [
            topQuizzesRows,
            topSavedQuizzesRows,
            topSavedDocumentsRows,
            revenueDayRows,
            revenueSumRow,
            activeSubscriptions,
            activeSubUsersCount,
            lifetimeVipCount,
            planBreakdownRows,
        ] = await Promise.all([
            this.prisma.$queryRaw<{ quizId: number; title: string; sessions: bigint }[]>`
                SELECT
                    q."id" AS "quizId",
                    q."title" AS "title",
                    COUNT(*)::bigint AS sessions
                FROM "GameLobby" l
                JOIN "GameLobbyReport" r ON r."lobbyId" = l."id"
                JOIN "Quiz" q ON q."id" = l."quizId"
                WHERE l."status" = 'CLOSED'
                GROUP BY q."id", q."title"
                ORDER BY sessions DESC
                LIMIT 10
            `,
            this.prisma.$queryRaw<{ quizId: number; title: string; saves: bigint }[]>`
                SELECT
                    q."id" AS "quizId",
                    q."title" AS "title",
                    COUNT(s."id")::bigint AS saves
                FROM "QuizSave" s
                JOIN "Quiz" q ON q."id" = s."quizId"
                GROUP BY q."id", q."title"
                ORDER BY saves DESC
                LIMIT 10
            `,
            this.prisma.$queryRaw<{ documentId: number; fileName: string; saves: bigint }[]>`
                SELECT
                    d."id" AS "documentId",
                    d."fileName" AS "fileName",
                    COUNT(s."id")::bigint AS saves
                FROM "DocumentSave" s
                JOIN "Document" d ON d."id" = s."documentId"
                GROUP BY d."id", d."fileName"
                ORDER BY saves DESC
                LIMIT 10
            `,
            this.prisma.$queryRaw<{ day: Date; amountCents: bigint }[]>`
                SELECT
                    date_trunc('day', "occurredAt") AS day,
                    SUM("amountCents")::bigint AS "amountCents"
                FROM "RevenueLedgerEntry"
                WHERE
                    "occurredAt" >= NOW() - (${rangeDays} * INTERVAL '1 day')
                GROUP BY day
                ORDER BY day ASC
            `,
            this.prisma.revenueLedgerEntry.aggregate({
                _sum: { amountCents: true },
            }),
            this.prisma.subscription.count({
                where: {
                    status: { in: ["active", "trialing"] },
                    currentPeriodEnd: { gt: now },
                },
            }),
            this.prisma.subscription.count({
                where: {
                    status: { in: ["active", "trialing"] },
                    currentPeriodEnd: { gt: now },
                },
                // distinct on userId isn't available in count; use groupBy below
            }).then(async () => {
                const rows = await this.prisma.subscription.findMany({
                    where: {
                        status: { in: ["active", "trialing"] },
                        currentPeriodEnd: { gt: now },
                    },
                    select: { userId: true } as any,
                    distinct: ["userId"] as any,
                });
                return rows.length;
            }),
            this.prisma.user.count({ where: { lifetimeVip: true } }),
            this.prisma.subscription.groupBy({
                by: ["stripePriceId"],
                _count: { _all: true },
            }),
        ]);

        const charts = {
            userGrowth: userGrowthRows.map((r) => ({
                date: this.formatDay(r.day),
                count: Number(r.count),
            })),
            quizGrowth: quizGrowthRows.map((r) => ({
                date: this.formatDay(r.day),
                count: Number(r.count),
            })),
            sessionsPlayed: sessionsPlayedRows.map((r) => ({
                date: this.formatDay(r.day),
                count: Number(r.count),
            })),
            topQuizzes: topQuizzesRows.map((r) => ({
                quizId: r.quizId,
                title: r.title,
                sessions: Number(r.sessions),
            })),
            topSavedQuizzes: topSavedQuizzesRows.map((r) => ({
                quizId: r.quizId,
                title: r.title,
                saves: Number(r.saves),
            })),
            topSavedDocuments: topSavedDocumentsRows.map((r) => ({
                documentId: r.documentId,
                fileName: r.fileName,
                saves: Number(r.saves),
            })),
            vipBreakdown: (() => {
                const lifetime = lifetimeVipCount;
                const activeRecurring = activeSubUsersCount;
                const free = Math.max(0, usersTotal - lifetime - activeRecurring);
                return [
                    { label: "Lifetime VIP", count: lifetime },
                    { label: "Active subscription", count: activeRecurring },
                    { label: "Free", count: free },
                ];
            })(),
            planBreakdown: planBreakdownRows
                .map((r) => ({
                    label: r.stripePriceId,
                    count: r._count._all,
                }))
                .sort((a, b) => b.count - a.count),
            revenueByDay: revenueDayRows.map((r) => ({
                date: this.formatDay(r.day),
                amountCents: Number(r.amountCents),
            })),
        };

        return {
            totals: {
                users: usersTotal,
                quizzes: quizzesTotal,
                documents: documentsTotal,
                revenueCentsAllTime: revenueSumRow._sum.amountCents ?? 0,
                activeSubscriptions,
            },
            charts,
        };
    }

    async getUsersPage(options: {
        page: number;
        pageSize: number;
        q?: string;
        sort?: "createdAt_desc" | "createdAt_asc";
    }): Promise<AdminUserListResponse> {
        const { page, pageSize } = options;
        const q = options.q?.trim();
        const sort = options.sort ?? "createdAt_desc";

        const where: Prisma.UserWhereInput = q
            ? {
                  OR: [
                      {
                          email: { contains: q, mode: "insensitive" },
                      },
                      {
                          name: { contains: q, mode: "insensitive" },
                      },
                  ],
              }
            : {};

        const totalItems = await this.prisma.user.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        const orderBy: Prisma.UserOrderByWithRelationInput = {
            createdAt: sort === "createdAt_asc" ? "asc" : "desc",
        };

        const users = (await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isBlocked: true,
                createdAt: true,
            } as any,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        })) as any[];

        return {
            items: users.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                isBlocked: u.isBlocked,
                createdAt: u.createdAt.toISOString(),
            })),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getUserDetail(userId: number) {
        const user = (await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isBlocked: true,
                createdAt: true,
                lifetimeVip: true,
                stripeCustomerId: true,
                subscription: {
                    select: {
                        status: true,
                        stripePriceId: true,
                        currentPeriodEnd: true,
                        cancelAtPeriodEnd: true,
                        updatedAt: true,
                    },
                },
                _count: {
                    select: {
                        quizzes: true,
                        documents: true,
                        quizSaves: true,
                        documentSaves: true,
                        lobbies: true,
                    },
                },
            } as any,
        })) as any;

        if (!user) throw new BadRequestException("User not found");

        return {
            ...user,
            createdAt:
                user.createdAt instanceof Date
                    ? user.createdAt.toISOString()
                    : String(user.createdAt),
            subscription: user.subscription
                ? {
                      ...user.subscription,
                      currentPeriodEnd:
                          user.subscription.currentPeriodEnd instanceof Date
                              ? user.subscription.currentPeriodEnd.toISOString()
                              : String(user.subscription.currentPeriodEnd),
                      updatedAt:
                          user.subscription.updatedAt instanceof Date
                              ? user.subscription.updatedAt.toISOString()
                              : String(user.subscription.updatedAt),
                  }
                : null,
        };
    }

    async getQuizzesPage(options: {
        page: number;
        pageSize: number;
        q?: string;
        sort?: "createdAt_desc" | "createdAt_asc" | "saves_desc";
    }): Promise<AdminQuizListResponse> {
        const { page, pageSize } = options;
        const q = options.q?.trim();
        const sort = options.sort ?? "createdAt_desc";

        const where: Prisma.QuizWhereInput = q
            ? {
                  title: { contains: q, mode: "insensitive" },
              }
            : {};

        const totalItems = await this.prisma.quiz.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        // For saves sort we need a join; simplest is queryRaw for ids.
        if (sort === "saves_desc") {
            const rows = await this.prisma.$queryRaw<
                { id: number; title: string; visibility: string; createdAt: Date; authorEmail: string; savesCount: bigint }[]
            >`
                SELECT
                    q."id" as id,
                    q."title" as title,
                    q."visibility" as visibility,
                    q."createdAt" as "createdAt",
                    u."email" as "authorEmail",
                    COUNT(s."id")::bigint as "savesCount"
                FROM "Quiz" q
                JOIN "User" u ON u."id" = q."userId"
                LEFT JOIN "QuizSave" s ON s."quizId" = q."id"
                WHERE (${q ? Prisma.sql`q."title" ILIKE ${"%" + q + "%"}` : Prisma.sql`TRUE`})
                GROUP BY q."id", u."email"
                ORDER BY "savesCount" DESC, q."createdAt" DESC
                OFFSET ${(page - 1) * pageSize}
                LIMIT ${pageSize}
            `;

            return {
                items: rows.map((r) => ({
                    id: r.id,
                    title: r.title,
                    visibility: (r.visibility as any) === "PUBLIC" ? "PUBLIC" : "PRIVATE",
                    createdAt: r.createdAt.toISOString(),
                    authorEmail: r.authorEmail,
                    savesCount: Number(r.savesCount),
                })),
                page,
                pageSize,
                totalItems,
                totalPages,
            };
        }

        const orderBy: Prisma.QuizOrderByWithRelationInput = {
            createdAt: sort === "createdAt_asc" ? "asc" : "desc",
        };

        const quizzes = await this.prisma.quiz.findMany({
            where,
            select: {
                id: true,
                title: true,
                visibility: true,
                createdAt: true,
                user: { select: { email: true } },
                _count: { select: { saves: true } },
            } as any,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            items: (quizzes as any[]).map((qz) => ({
                id: qz.id,
                title: qz.title,
                visibility: qz.visibility,
                createdAt: qz.createdAt.toISOString(),
                authorEmail: qz.user?.email ?? "—",
                savesCount: qz._count?.saves ?? 0,
            })),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getQuizDetail(quizId: number) {
        const quiz = (await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                id: true,
                title: true,
                description: true,
                coverUrl: true,
                visibility: true,
                createdAt: true,
                user: { select: { id: true, email: true } },
                _count: { select: { questions: true, saves: true, lobby: true } },
            } as any,
        })) as any;
        if (!quiz) throw new BadRequestException("Quiz not found");

        const recentSessions = (await this.prisma.gameLobby.findMany({
            where: { quizId },
            select: {
                id: true,
                pin: true,
                status: true,
                createdAt: true,
                endedAt: true,
                host: { select: { email: true } },
                report: { select: { totalPlayers: true } },
            } as any,
            orderBy: { createdAt: "desc" },
            take: 10,
        })) as any[];

        return {
            ...quiz,
            createdAt: quiz.createdAt.toISOString(),
            author: quiz.user,
            counts: {
                questions: quiz._count?.questions ?? 0,
                saves: quiz._count?.saves ?? 0,
                sessions: quiz._count?.lobby ?? 0,
            },
            recentSessions: (recentSessions as any[]).map((s) => ({
                id: s.id,
                pin: s.pin,
                status: s.status,
                createdAt: s.createdAt.toISOString(),
                endedAt: s.endedAt ? s.endedAt.toISOString() : null,
                hostEmail: s.host?.email ?? "—",
                totalPlayers: s.report?.totalPlayers ?? null,
            })),
        };
    }

    async getDocumentsPage(options: {
        page: number;
        pageSize: number;
        q?: string;
        status?: "UPLOADED" | "PARSING" | "READY" | "ERROR";
        sort?: "createdAt_desc" | "createdAt_asc" | "saves_desc";
    }): Promise<AdminDocumentListResponse> {
        const { page, pageSize } = options;
        const q = options.q?.trim();
        const status = options.status;
        const sort = options.sort ?? "createdAt_desc";

        const where: Prisma.DocumentWhereInput = {
            ...(q
                ? {
                      fileName: { contains: q, mode: "insensitive" },
                  }
                : {}),
            ...(status ? { status } : {}),
        };

        const totalItems = await this.prisma.document.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        if (sort === "saves_desc") {
            const rows = await this.prisma.$queryRaw<
                {
                    id: number;
                    fileName: string;
                    status: string;
                    visibility: string;
                    fileSize: number;
                    createdAt: Date;
                    authorEmail: string;
                    savesCount: bigint;
                }[]
            >`
                SELECT
                    d."id" as id,
                    d."fileName" as "fileName",
                    d."status" as status,
                    d."visibility" as visibility,
                    d."fileSize" as "fileSize",
                    d."createdAt" as "createdAt",
                    u."email" as "authorEmail",
                    COUNT(s."id")::bigint as "savesCount"
                FROM "Document" d
                JOIN "User" u ON u."id" = d."userId"
                LEFT JOIN "DocumentSave" s ON s."documentId" = d."id"
                WHERE
                    (${q ? Prisma.sql`d."fileName" ILIKE ${"%" + q + "%"}` : Prisma.sql`TRUE`})
                    AND (${status ? Prisma.sql`d."status" = ${status}` : Prisma.sql`TRUE`})
                GROUP BY d."id", u."email"
                ORDER BY "savesCount" DESC, d."createdAt" DESC
                OFFSET ${(page - 1) * pageSize}
                LIMIT ${pageSize}
            `;

            return {
                items: rows.map((r) => ({
                    id: r.id,
                    fileName: r.fileName,
                    status: (r.status as any),
                    visibility: (r.visibility as any) === "PUBLIC" ? "PUBLIC" : "PRIVATE",
                    fileSize: r.fileSize,
                    createdAt: r.createdAt.toISOString(),
                    authorEmail: r.authorEmail,
                    savesCount: Number(r.savesCount),
                })),
                page,
                pageSize,
                totalItems,
                totalPages,
            };
        }

        const orderBy: Prisma.DocumentOrderByWithRelationInput = {
            createdAt: sort === "createdAt_asc" ? "asc" : "desc",
        };

        const documents = await this.prisma.document.findMany({
            where,
            select: {
                id: true,
                fileName: true,
                status: true,
                visibility: true,
                fileSize: true,
                createdAt: true,
                user: { select: { email: true } },
                _count: { select: { saves: true } },
            } as any,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            items: (documents as any[]).map((d) => ({
                id: d.id,
                fileName: d.fileName,
                status: d.status,
                visibility: d.visibility,
                fileSize: d.fileSize,
                createdAt: d.createdAt.toISOString(),
                authorEmail: d.user?.email ?? "—",
                savesCount: d._count?.saves ?? 0,
            })),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getDocumentDetail(documentId: number) {
        const doc = (await this.prisma.document.findUnique({
            where: { id: documentId },
            select: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileSize: true,
                mimeType: true,
                cloudinaryPublicId: true,
                status: true,
                visibility: true,
                createdAt: true,
                user: { select: { id: true, email: true } },
                _count: { select: { chunks: true, saves: true } },
            } as any,
        })) as any;
        if (!doc) throw new BadRequestException("Document not found");

        return {
            ...doc,
            createdAt: doc.createdAt.toISOString(),
            author: doc.user,
            counts: {
                chunks: doc._count?.chunks ?? 0,
                saves: doc._count?.saves ?? 0,
            },
        };
    }

    async getSessionsPage(options: {
        page: number;
        pageSize: number;
        q?: string;
        status?: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
        sort?: "createdAt_desc" | "createdAt_asc" | "endedAt_desc";
    }): Promise<AdminSessionListResponse> {
        const { page, pageSize } = options;
        const q = options.q?.trim();
        const status = options.status;
        const sort = options.sort ?? "createdAt_desc";

        const where: Prisma.GameLobbyWhereInput = {
            ...(status ? { status } : {}),
            ...(q
                ? {
                      OR: [
                          { pin: { contains: q } },
                          { quiz: { title: { contains: q, mode: "insensitive" } } },
                          { host: { email: { contains: q, mode: "insensitive" } } },
                      ],
                  }
                : {}),
        };

        const totalItems = await this.prisma.gameLobby.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        const orderBy: Prisma.GameLobbyOrderByWithRelationInput =
            sort === "createdAt_asc"
                ? { createdAt: "asc" }
                : sort === "endedAt_desc"
                    ? { endedAt: "desc" }
                    : { createdAt: "desc" };

        const sessions = await this.prisma.gameLobby.findMany({
            where,
            select: {
                id: true,
                pin: true,
                status: true,
                createdAt: true,
                endedAt: true,
                quizId: true,
                quiz: { select: { title: true } },
                host: { select: { email: true } },
                report: { select: { totalPlayers: true } },
            } as any,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            items: (sessions as any[]).map((s) => ({
                id: s.id,
                pin: s.pin,
                status: s.status,
                createdAt: s.createdAt.toISOString(),
                endedAt: s.endedAt ? s.endedAt.toISOString() : null,
                quizId: s.quizId,
                quizTitle: s.quiz?.title ?? "—",
                hostEmail: s.host?.email ?? "—",
                totalPlayers: s.report?.totalPlayers ?? null,
            })),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getSessionDetail(sessionId: number) {
        const lobby = (await this.prisma.gameLobby.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                pin: true,
                status: true,
                createdAt: true,
                endedAt: true,
                quizId: true,
                quiz: { select: { title: true } },
                host: { select: { id: true, email: true } },
                report: {
                    select: {
                        totalPlayers: true,
                        totalQuestions: true,
                        totalAnswers: true,
                        totalCorrect: true,
                        totalIncorrect: true,
                        avgAccuracy: true,
                        createdAt: true,
                    },
                },
            } as any,
        })) as any;
        if (!lobby) throw new BadRequestException("Session not found");

        return {
            id: lobby.id,
            pin: lobby.pin,
            status: lobby.status,
            createdAt: lobby.createdAt.toISOString(),
            endedAt: lobby.endedAt ? lobby.endedAt.toISOString() : null,
            quiz: { id: lobby.quizId, title: lobby.quiz?.title ?? "—" },
            host: lobby.host,
            report: lobby.report
                ? { ...lobby.report, createdAt: lobby.report.createdAt.toISOString() }
                : null,
        };
    }

    async getRevenuePage(options: {
        page: number;
        pageSize: number;
        q?: string;
    }): Promise<AdminRevenuePageResponse> {
        const { page, pageSize } = options;
        const q = options.q?.trim();

        const where: Prisma.RevenueLedgerEntryWhereInput = q
            ? {
                  OR: [
                      { stripeInvoiceId: { contains: q, mode: "insensitive" } },
                      { user: { email: { contains: q, mode: "insensitive" } } },
                  ],
              }
            : {};

        const totalItems = await this.prisma.revenueLedgerEntry.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        const ledger = await this.prisma.revenueLedgerEntry.findMany({
            where,
            select: {
                id: true,
                stripeInvoiceId: true,
                amountCents: true,
                currency: true,
                occurredAt: true,
                user: { select: { email: true } },
            } as any,
            orderBy: { occurredAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const recentSubscriptions = await this.prisma.subscription.findMany({
            select: {
                id: true,
                status: true,
                stripePriceId: true,
                currentPeriodEnd: true,
                cancelAtPeriodEnd: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { email: true } },
            } as any,
            orderBy: { updatedAt: "desc" },
            take: 50,
        });

        return {
            ledger: {
                items: (ledger as any[]).map((e) => ({
                    id: e.id,
                    stripeInvoiceId: e.stripeInvoiceId,
                    amountCents: e.amountCents,
                    currency: e.currency,
                    occurredAt: e.occurredAt.toISOString(),
                    userEmail: e.user?.email ?? null,
                })),
                page,
                pageSize,
                totalItems,
                totalPages,
            },
            recentSubscriptions: (recentSubscriptions as any[]).map((s) => ({
                id: s.id,
                userEmail: s.user?.email ?? "—",
                status: s.status,
                stripePriceId: s.stripePriceId,
                currentPeriodEnd: s.currentPeriodEnd.toISOString(),
                cancelAtPeriodEnd: !!s.cancelAtPeriodEnd,
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString(),
            })),
        };
    }

    async updateUserRoleAndBlock(
        userId: number,
        payload: { role?: UserRole; isBlocked?: boolean },
    ) {
        const data: any = {};

        if (payload.isBlocked === true) {
            const existingForBlock = (await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    role: true,
                } as any,
            })) as any;

            if (!existingForBlock) {
                throw new BadRequestException("User not found");
            }

            if (existingForBlock.role === "ADMIN") {
                throw new ForbiddenException("Admins cannot block other admins");
            }
        }

        if (payload.role !== undefined) {
            const existingForRole = (await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    role: true,
                } as any,
            })) as any;

            if (!existingForRole) {
                throw new BadRequestException("User not found");
            }

            if (existingForRole.role === "ADMIN" && payload.role === "USER") {
                throw new ForbiddenException("Admins cannot demote other admins");
            }
        }

        if (payload.role !== undefined) {
            data.role = payload.role;
        }
        if (payload.isBlocked !== undefined) {
            data.isBlocked = payload.isBlocked;
        }

        if (Object.keys(data).length === 0) {
            const existing = (await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isBlocked: true,
                    createdAt: true,
                } as any,
            })) as any;
            if (!existing) throw new BadRequestException("User not found");
            return {
                ...existing,
                createdAt: existing.createdAt.toISOString(),
            };
        }

        const updated = (await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isBlocked: true,
                createdAt: true,
            } as any,
        })) as any;

        return {
            ...updated,
            createdAt: updated.createdAt.toISOString(),
        };
    }
}

