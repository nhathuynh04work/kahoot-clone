import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { QuizService } from "../quiz/quiz.service.js";
import { Prisma, Question } from "../../generated/prisma/client.js";
import { QuestionWithOptions } from "./dto/question.dto.js";

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
    }): Promise<QuestionWithOptions> {
        const quiz = await this.prisma.quiz.findFirst({
            where: {
                id: quizId,
                userId: userId,
            },
            include: {
                questions: {
                    orderBy: {
                        sortOrder: "desc",
                    },
                    take: 1, // Only get the one with the highest sortOrder
                },
            },
        });

        if (!quiz)
            throw new NotFoundException(
                "Quiz not found or you do not have permission.",
            );

        const payload: Prisma.QuestionCreateInput = {
            sortOrder: quiz.questions[0].sortOrder + 1,
            quiz: {
                connect: {
                    id: quizId,
                },
            },
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
        };

        return this.prisma.question.create({
            data: payload,
            include: { options: true },
        });
    }

    async update(data: {
        questionId: number;
        quizId: number;
        userId: number;
        payload: Prisma.QuestionUpdateInput;
    }): Promise<QuestionWithOptions> {
        // This perform checking quiz existence and the quiz ownership
        await this.quizService.getQuizMetadata(data.quizId, data.userId);

        try {
            return this.prisma.question.update({
                where: {
                    id: data.questionId,
                    quizId: data.quizId,
                },
                data: data.payload,
                include: {
                    options: true,
                },
            });
        } catch (error) {
            if (error.code === "P2025")
                throw new NotFoundException(
                    "Question not found or it does not belong to this quiz.",
                );

            throw error;
        }
    }

    async delete(data: {
        questionId: number;
        quizId: number;
        userId: number;
    }): Promise<Question> {
        const { questionCount } = await this.quizService.getQuizMetadata(
            data.quizId,
            data.userId,
        );

        if (questionCount < 2)
            throw new BadRequestException(
                "Not allowed to delete all questions",
            );

        try {
            return this.prisma.question.delete({
                where: {
                    id: data.questionId,
                    quizId: data.quizId,
                },
            });
        } catch (error) {
            if (error.code === "P2025")
                throw new NotFoundException(
                    "Question not found or it does not belong to this quiz.",
                );

            throw error;
        }
    }

    async gradeAnswer(params: { questionId: number; optionId: number }) {
        const { questionId, optionId } = params;

        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { options: true },
        });

        if (!question) throw new NotFoundException("Question not found");

        const option = question.options.find((o) => o.id === optionId);

        if (!option) return { isCorrect: false, points: 0 };

        const isCorrect = option.isCorrect;
        const points = isCorrect ? question.points : 0;

        return { isCorrect, points };
    }
}
