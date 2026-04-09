import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {
    LobbyStatus,
    Prisma,
    Question,
    QuestionType,
    Quiz,
    SaveTargetType,
} from "../generated/prisma/client.js";
import { UserService } from "../user/user.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { EntitlementService } from "../entitlements/entitlement.service.js";
import Redis from "ioredis";
import { quizQuestionsKey } from "../lib/redis-key-factory.js";
import {
    attachClientOptions,
    defaultQuestionData,
    validateQuestionDataForSave,
} from "./question-payload.js";

/** Transaction client type workaround for Prisma + custom adapter */
type TxClient = Pick<PrismaService, "quiz" | "question">;
import { QuizFullDetails, QuizWithQuestions } from "./dto/quiz.dto.js";
import { UpdateQuizDto, UpdateQuestionDto } from "./dto/update-quiz.dto.js";

@Injectable()
export class QuizService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private entitlementService: EntitlementService,
        @Inject("REDIS_CLIENT") private readonly redis: Redis,
    ) {}

    private toQuizFullDetails(
        quiz: Quiz & {
            user?: { name: string | null; email: string | null } | null;
            questions: Question[];
        },
    ): QuizFullDetails {
        const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
        const { user: _user, ...rest } = quiz;
        return {
            ...rest,
            authorName,
            questions: quiz.questions.map((q) => attachClientOptions(q)),
        };
    }

    async getQuiz(id: number, userId: number): Promise<QuizFullDetails> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                questions: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!quiz) throw new NotFoundException("Quiz not found");

        if (quiz.userId !== userId)
            throw new ForbiddenException(
                "Not allowed to see this quiz details",
            );

        return this.toQuizFullDetails(quiz);
    }

    async getQuizzes(userId: number): Promise<QuizWithQuestions[]> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const quizzes = await this.prisma.quiz.findMany({
            where: { userId },
            include: {
                questions: { orderBy: { sortOrder: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });

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

    async getQuizPage(
        userId: number,
        options: { q?: string; page: number; pageSize: number; sort?: string },
    ) {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const page = Number.isFinite(options.page) ? Math.max(1, options.page) : 1;
        const pageSize = Number.isFinite(options.pageSize)
            ? Math.min(200, Math.max(1, options.pageSize))
            : 20;
        const q = options.q?.trim();
        const sort = options.sort?.trim();

        const orderBy: Prisma.QuizOrderByWithRelationInput[] = (() => {
            switch (sort) {
                case "createdAt_asc":
                    return [{ createdAt: "asc" }, { id: "asc" }];
                case "createdAt_desc":
                    return [{ createdAt: "desc" }, { id: "desc" }];
                case "title_asc":
                    return [{ title: "asc" }, { id: "desc" }];
                case "title_desc":
                    return [{ title: "desc" }, { id: "desc" }];
                default:
                    return [{ id: "desc" }];
            }
        })();

        const where: Prisma.QuizWhereInput = {
            userId,
            ...(q
                ? {
                      OR: [
                          { title: { contains: q, mode: "insensitive" } },
                          ...(q.toLowerCase() === "untitled"
                              ? [{ title: "" }]
                              : []),
                      ],
                  }
                : {}),
        };

        const totalItems = await this.prisma.quiz.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        const items = await this.prisma.quiz.findMany({
            where,
            include: {
                questions: { orderBy: { sortOrder: "asc" } },
                user: { select: { name: true, email: true } },
            },
            orderBy,
            skip,
            take: pageSize,
        });

        const quizIds = items.map((q) => q.id);
        const [saveCounts, playCounts] = await Promise.all([
            this.getQuizSaveCounts(quizIds),
            this.getQuizPlayCounts(quizIds),
        ]);

        const quizzes = items.map((quiz) => {
            const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
            const { user: _user, ...rest } = quiz;
            return {
                ...rest,
                authorName,
                saveCount: saveCounts.get(quiz.id) ?? 0,
                playCount: playCounts.get(quiz.id) ?? 0,
            };
        });

        return {
            items: quizzes,
            page: safePage,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async create(userId: number): Promise<Quiz> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const mcData = defaultQuestionData(QuestionType.MULTIPLE_CHOICE);

        const payload: Prisma.QuizCreateInput = {
            title: "",
            user: {
                connect: {
                    id: userId,
                },
            },
            questions: {
                create: [
                    {
                        text: "",
                        sortOrder: 0,
                        type: QuestionType.MULTIPLE_CHOICE,
                        data: mcData as unknown as Prisma.InputJsonValue,
                    },
                ],
            },
        };

        return this.prisma.quiz.create({ data: payload });
    }

    async update({
        id,
        userId,
        data,
    }: {
        id: number;
        userId: number;
        data: UpdateQuizDto;
    }): Promise<QuizFullDetails> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const existingQuiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { orderBy: { sortOrder: "asc" } } },
        });
        if (!existingQuiz) throw new NotFoundException("Quiz not found");

        if (userId !== existingQuiz.userId)
            throw new ForbiddenException("Cannot update others' quizzes");

        const { questions, ...quizData } = data;

        if (questions) {
            const merged = this.mergeQuestionsForSave(existingQuiz.questions, questions);
            await this.assertQuizQuestionsAllowed(userId, merged);
        }

        await this.prisma.$transaction(async (tx) => {
            const db = tx as unknown as TxClient;
            await db.quiz.update({
                where: { id },
                data: quizData,
            });

            if (questions) {
                const incomingQuestionIds = questions
                    .filter((q) => q.id && q.id > 0)
                    .map((q) => q.id);

                await db.question.deleteMany({
                    where: {
                        quizId: id,
                        id: { notIn: incomingQuestionIds as number[] },
                    },
                });

                for (const q of questions) {
                    const { id: qId, ...qFields } = q;
                    const prev = existingQuiz.questions.find((p) => p.id === qId);
                    const type =
                        q.type ?? prev?.type ?? QuestionType.MULTIPLE_CHOICE;
                    const mergedData = this.resolveQuestionData(q, prev, type);

                    validateQuestionDataForSave(type, mergedData);

                    const dataPayload: Prisma.QuestionUpdateInput = {
                        type,
                        data: mergedData as Prisma.InputJsonValue,
                    };
                    if (qFields.text !== undefined) dataPayload.text = qFields.text;
                    if (qFields.timeLimit !== undefined) dataPayload.timeLimit = qFields.timeLimit;
                    if (qFields.points !== undefined) dataPayload.points = qFields.points;
                    if (qFields.imageUrl !== undefined) dataPayload.imageUrl = qFields.imageUrl;
                    if (qFields.sortOrder !== undefined) dataPayload.sortOrder = qFields.sortOrder;

                    if (qId && qId > 0) {
                        await db.question.update({
                            where: { id: qId },
                            data: dataPayload,
                        });
                    } else {
                        await db.question.create({
                            data: {
                                quizId: id,
                                text: qFields.text ?? "",
                                timeLimit: qFields.timeLimit ?? 20000,
                                points: qFields.points ?? 1000,
                                imageUrl: qFields.imageUrl ?? null,
                                sortOrder: qFields.sortOrder ?? 0,
                                type,
                                data: mergedData as Prisma.InputJsonValue,
                            },
                        });
                    }
                }
            }
        });

        await this.redis.del(quizQuestionsKey(id));

        const updated = await this.prisma.quiz.findUniqueOrThrow({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                questions: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        return this.toQuizFullDetails(updated);
    }

    private mergeQuestionsForSave(
        prevQuestions: Question[],
        incoming: UpdateQuestionDto[],
    ): UpdateQuestionDto[] {
        return incoming.map((q) => {
            const prev = prevQuestions.find((p) => p.id === q.id);
            const type = q.type ?? prev?.type ?? QuestionType.MULTIPLE_CHOICE;
            const data = this.resolveQuestionData(q, prev, type);
            return { ...q, type, data: data as unknown as Record<string, unknown> };
        });
    }

    private resolveQuestionData(
        q: UpdateQuestionDto,
        prev: Question | undefined,
        type: QuestionType,
    ): Prisma.JsonValue {
        if (q.data !== undefined && q.data !== null) {
            return q.data as unknown as Prisma.JsonValue;
        }
        if (prev?.data != null) {
            return prev.data as Prisma.JsonValue;
        }
        return defaultQuestionData(type) as unknown as Prisma.JsonValue;
    }

    async delete(id: number, userId: number) {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException("Quiz not found");

        if (userId !== quiz.userId)
            throw new ForbiddenException("Cannot delete others' quizzes");

        await this.redis.del(quizQuestionsKey(id));
        await this.prisma.save.deleteMany({
            where: { targetType: SaveTargetType.QUIZ, targetId: id },
        });
        await this.prisma.quiz.delete({ where: { id } });
    }

    async getQuizMetadata(
        id: number,
        userId: number,
    ): Promise<{ quiz: Quiz; questionCount: number }> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });

        if (!quiz) throw new NotFoundException("Quiz not found");

        if (quiz.userId !== userId)
            throw new ForbiddenException("Not allowed to access this quiz");

        return { quiz, questionCount: quiz._count.questions };
    }

    private async assertQuizQuestionsAllowed(userId: number, questions: UpdateQuestionDto[]) {
        const limits = await this.entitlementService.getLimitsForUser(userId);
        if (questions.length > limits.maxQuestionsPerQuiz) {
            throw new ForbiddenException(
                `You can have at most ${limits.maxQuestionsPerQuiz} questions per quiz. Upgrade to VIP for a higher limit.`,
            );
        }
        const { isVip } = await this.entitlementService.getVipStatus(userId);
        for (const q of questions) {
            const type = q.type ?? QuestionType.MULTIPLE_CHOICE;
            if (
                (type === QuestionType.SHORT_ANSWER || type === QuestionType.NUMBER_INPUT) &&
                !isVip
            ) {
                throw new ForbiddenException(
                    "Short answer and number input questions are available for VIP accounts only.",
                );
            }
            const data = q.data as unknown as Prisma.JsonValue;
            validateQuestionDataForSave(type, data);
        }
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
