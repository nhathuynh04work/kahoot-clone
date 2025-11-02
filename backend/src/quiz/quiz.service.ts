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

    async getQuiz(id: number, userId: number): Promise<QuizFullDetails | null> {
        const user = await this.userService.getUser({ id: userId });
        if (!user) throw new BadRequestException("User not found");

        return this.prisma.quiz.findUnique({
            where: { id, userId },
            include: { questions: { include: { options: true } } },
        });
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
}
