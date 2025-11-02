import { BadRequestException, Injectable } from "@nestjs/common";
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
}
