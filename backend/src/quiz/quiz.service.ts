import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, Question, Quiz } from "../generated/prisma/client.js";
import { UserService } from "../user/user.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
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

        return quiz;
    }

    async getQuizzes(userId: number): Promise<QuizWithQuestions[]> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        return this.prisma.quiz.findMany({
            where: { userId },
            include: { questions: true },
        });
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
            await tx.quiz.update({
                where: { id },
                data: quizData,
            });

            if (questions) {
                const incomingQuestionIds = questions
                    .filter((q) => q.id && q.id > 0)
                    .map((q) => q.id);

                await tx.question.deleteMany({
                    where: {
                        quizId: id,
                        id: { notIn: incomingQuestionIds as number[] },
                    },
                });

                for (const q of questions) {
                    const { options, id: qId, ...qData } = q;
                    let savedQuestion: Question;

                    if (qId && qId > 0) {
                        savedQuestion = await tx.question.update({
                            where: { id: qId },
                            data: qData,
                        });
                    } else {
                        savedQuestion = await tx.question.create({
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

                        await tx.option.deleteMany({
                            where: {
                                questionId: savedQuestion.id,
                                id: { notIn: incomingOptionIds as number[] },
                            },
                        });

                        for (const o of options) {
                            const { id: oId, ...oData } = o;
                            if (oId && oId > 0) {
                                await tx.option.update({
                                    where: { id: oId },
                                    data: oData,
                                });
                            } else {
                                await tx.option.create({
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
}
