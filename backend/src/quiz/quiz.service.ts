import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { LobbyStatus, Prisma, Question, Quiz } from "../generated/prisma/client.js";
import { UserService } from "../user/user.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

/** Transaction client type workaround for Prisma + custom adapter */
type TxClient = Pick<
    PrismaService,
    "quiz" | "question" | "option"
>;
import { QuizFullDetails, QuizWithQuestions } from "./dto/quiz.dto.js";
import { UpdateQuizDto } from "./dto/update-quiz.dto.js";

@Injectable()
export class QuizService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) {}

    async getQuiz(id: number, userId: number): Promise<QuizFullDetails> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                questions: {
                    include: { options: true },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!quiz) throw new NotFoundException("Quiz not found");

        if (quiz.userId !== userId)
            throw new ForbiddenException(
                "Not allowed to see this quiz details",
            );

        const authorName = quiz.user?.name ?? quiz.user?.email ?? null;
        // Keep API payload small: return `authorName` instead of the full user object.
         
        const { user: _user, ...rest } = quiz;
        return { ...rest, authorName };
    }

    async getQuizzes(userId: number): Promise<QuizWithQuestions[]> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const quizzes = await this.prisma.quiz.findMany({
            where: { userId },
            include: {
                questions: true,
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
                          // Treat empty titles as "Untitled" in UI; searching "untitled" should match those.
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
                questions: true,
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
                        options: {
                            create: [
                                {
                                    text: "Option 1",
                                    isCorrect: true,
                                    sortOrder: 0,
                                },
                                {
                                    text: "Option 2",
                                    isCorrect: false,
                                    sortOrder: 1,
                                },
                            ],
                        },
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
        });
        if (!existingQuiz) throw new NotFoundException("Quiz not found");

        if (userId !== existingQuiz.userId)
            throw new ForbiddenException("Cannot update others' quizzes");

        const { questions, ...quizData } = data;

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
                    const { options, id: qId, ...qData } = q;
                    let savedQuestion: Question;

                    if (qId && qId > 0) {
                        savedQuestion = await db.question.update({
                            where: { id: qId },
                            data: qData,
                        });
                    } else {
                        savedQuestion = await db.question.create({
                            data: {
                                ...qData,
                                sortOrder: qData.sortOrder ?? 0,
                                quizId: id,
                            },
                        });
                    }

                    if (options) {
                        const incomingOptionIds = options
                            .filter((o) => o.id && o.id > 0)
                            .map((o) => o.id);

                        await db.option.deleteMany({
                            where: {
                                questionId: savedQuestion.id,
                                id: { notIn: incomingOptionIds as number[] },
                            },
                        });

                        for (const o of options) {
                            const { id: oId, ...oData } = o;
                            if (oId && oId > 0) {
                                await db.option.update({
                                    where: { id: oId },
                                    data: oData,
                                });
                            } else {
                                await db.option.create({
                                    data: {
                                        ...oData,
                                        sortOrder: oData.sortOrder ?? 0,
                                        questionId: savedQuestion.id,
                                    },
                                });
                            }
                        }
                    }
                }
            }
        });

        return this.prisma.quiz.findUniqueOrThrow({
            where: { id },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
    }

    async delete(id: number, userId: number) {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException("Quiz not found");

        if (userId !== quiz.userId)
            throw new ForbiddenException("Cannot delete others' quizzes");

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
}
