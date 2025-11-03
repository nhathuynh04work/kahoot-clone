import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Prisma, Quiz } from "../../generated/prisma/client.js";
import { UserService } from "../user/user.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { QuizFullDetails, QuizWithQuestions } from "./dto/quiz.dto.js";

@Injectable()
export class QuizService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) {}

    async getQuiz(id: number, userId: number): Promise<QuizFullDetails> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { include: { options: true } } },
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
        data: Prisma.QuizUpdateInput;
    }): Promise<QuizFullDetails> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException("Quiz not found");

        if (userId !== quiz.userId)
            throw new ForbiddenException("Cannot update others' quizzes");

        return this.prisma.quiz.update({
            where: { id },
            data,
            include: { questions: { include: { options: true } } },
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
