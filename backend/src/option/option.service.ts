import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Option, Prisma } from "../../generated/prisma/client.js";
import { CreateOptionDto } from "./dto/create-option.dto.js";

@Injectable()
export class OptionService {
    constructor(private prisma: PrismaService) {}

    async create(data: {
        quizId: number;
        questionId: number;
        userId: number;
        payload: CreateOptionDto;
    }): Promise<Option> {
        const question = await this.prisma.question.findFirst({
            where: {
                id: data.questionId,
                quizId: data.quizId,
            },
            include: {
                quiz: true,
                _count: {
                    select: { options: true },
                },
            },
        });

        if (!question)
            throw new NotFoundException("Question not found in this quiz.");

        if (question.quiz.userId !== data.userId)
            throw new ForbiddenException(
                "You do not have permission to access this resource.",
            );

        const createData: Prisma.OptionCreateInput = {
            text: data.payload.text,
            isCorrect: false,
            sortOrder: question._count.options,
            question: {
                connect: { id: data.questionId },
            },
        };

        return this.prisma.option.create({ data: createData });
    }

    async update(data: {
        quizId: number;
        questionId: number;
        optionId: number;
        userId: number;
        payload: Prisma.OptionUpdateInput;
    }): Promise<Option> {
        const option = await this.prisma.option.findFirst({
            where: {
                id: data.optionId,
                questionId: data.questionId,
                question: {
                    quizId: data.quizId,
                    quiz: {
                        userId: data.userId,
                    },
                },
            },
        });

        if (!option)
            throw new NotFoundException(
                "Option not found or you do not have permission.",
            );

        return this.prisma.option.update({
            where: { id: data.optionId },
            data: data.payload,
        });
    }

    async delete(data: {
        quizId: number;
        questionId: number;
        optionId: number;
        userId: number;
    }) {
        const option = await this.prisma.option.findFirst({
            where: {
                id: data.optionId,
                questionId: data.questionId,
                question: {
                    quizId: data.quizId,
                    quiz: { userId: data.userId },
                },
            },
        });

        if (!option)
            throw new NotFoundException(
                "Option not found or you do not have permission.",
            );

        return this.prisma.option.delete({
            where: {
                id: data.optionId,
            },
        });
    }
}
