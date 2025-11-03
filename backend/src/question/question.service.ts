import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { QuizService } from "../quiz/quiz.service.js";
import { Prisma, Question } from "../../generated/prisma/client.js";

@Injectable()
export class QuestionService {
    constructor(
        private prisma: PrismaService,
        private quizService: QuizService,
    ) {}

    async create({
        quizId,
        userId,
    }: {
        quizId: number;
        userId: number;
    }): Promise<Question> {
        // This perform checking quiz existence and the quiz ownership
        const { questionCount } = await this.quizService.getQuizMetadata(
            quizId,
            userId,
        );

        const payload: Prisma.QuestionCreateInput = {
            sortOrder: questionCount,
            quiz: {
                connect: {
                    id: quizId,
                },
            },
        };

        return this.prisma.question.create({ data: payload });
    }
}
