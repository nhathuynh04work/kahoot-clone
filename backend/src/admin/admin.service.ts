import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma, UserRole } from "../generated/prisma/client.js";

type DashboardTotals = {
    users: number;
    quizzes: number;
    documents: number;
};

type GrowthPoint = { date: string; count: number };
type AccuracyPoint = { date: string; avgAccuracy: number };
type StatusCountPoint = { status: string; count: number };
type TopQuizPoint = { quizId: number; title: string; sessions: number };
type RevenuePoint = { date: string; amountCents: number };

export type AdminDashboardStatsResponse = {
    totals: DashboardTotals & {
        revenueCentsAllTime: number;
        activeSubscriptions: number;
    };
    charts: {
        userGrowth: GrowthPoint[];
        quizGrowth: GrowthPoint[];
        sessionsPlayed: GrowthPoint[];
        activeSessions: StatusCountPoint[];
        avgAccuracyOverTime: AccuracyPoint[];
        topQuizzes: TopQuizPoint[];
        documentStatusBreakdown: StatusCountPoint[];
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

        const [userGrowthRows, quizGrowthRows, sessionsPlayedRows, avgAccuracyRows] =
            await Promise.all([
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
                this.prisma.$queryRaw<{ day: Date; avgAccuracy: number }[]>`
                    SELECT
                        date_trunc('day', l."endedAt") AS day,
                        AVG(r."avgAccuracy") AS "avgAccuracy"
                    FROM "GameLobbyReport" r
                    JOIN "GameLobby" l ON l."id" = r."lobbyId"
                    WHERE
                        l."status" = 'CLOSED'
                        AND l."endedAt" IS NOT NULL
                        AND l."endedAt" >= NOW() - (${rangeDays} * INTERVAL '1 day')
                    GROUP BY day
                    ORDER BY day ASC
                `,
            ]);

        const [
            activeSessionsRows,
            topQuizzesRows,
            documentStatusRows,
            revenueDayRows,
            revenueSumRow,
            activeSubscriptions,
        ] = await Promise.all([
            this.prisma.$queryRaw<{ status: string; count: bigint }[]>`
                SELECT
                    status,
                    COUNT(*)::bigint AS count
                FROM "GameLobby"
                WHERE status != 'CLOSED'
                GROUP BY status
                ORDER BY count DESC
            `,
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
                LIMIT 5
            `,
            this.prisma.$queryRaw<{ status: string; count: bigint }[]>`
                SELECT
                    status,
                    COUNT(*)::bigint AS count
                FROM "Document"
                GROUP BY status
                ORDER BY count DESC
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
                    currentPeriodEnd: { gt: new Date() },
                },
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
            activeSessions: activeSessionsRows.map((r) => ({
                status: r.status,
                count: Number(r.count),
            })),
            avgAccuracyOverTime: avgAccuracyRows.map((r) => ({
                date: this.formatDay(r.day),
                avgAccuracy: Number(r.avgAccuracy),
            })),
            topQuizzes: topQuizzesRows.map((r) => ({
                quizId: r.quizId,
                title: r.title,
                sessions: Number(r.sessions),
            })),
            documentStatusBreakdown: documentStatusRows.map((r) => ({
                status: r.status,
                count: Number(r.count),
            })),
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

