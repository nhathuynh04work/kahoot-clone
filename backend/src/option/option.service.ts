import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Option, Prisma } from "../generated/prisma/client.js";
import { CreateOptionDto } from "./dto/create-option.dto.js";
import { UpdateOptionDto } from "./dto/update-option.dto.js";

@Injectable()
export class OptionService {
    constructor(private prisma: PrismaService) {}

    private async validateOwnership(data: {
        quizId: number;
        questionId: number;
        optionId: number;
        userId: number;
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

        return option;
    }

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
                options: {
                    orderBy: {
                        sortOrder: "desc",
                    },
                    take: 1, // Only get the one with the highest sortOrder
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
            sortOrder: question.options[0].sortOrder + 1,
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
        payload: UpdateOptionDto;
    }): Promise<Option> {
        const currentOption = await this.validateOwnership(data);

        const { isCorrect } = data.payload;

        if (isCorrect === true) {
            // Rule: Set this option to correct and all others to false.
            return this.prisma.$transaction(async (tx) => {
                // Set all other options for this question to false
                await tx.option.updateMany({
                    where: {
                        questionId: data.questionId,
                        NOT: { id: data.optionId },
                    },
                    data: { isCorrect: false },
                });

                // Update the target option
                return tx.option.update({
                    where: { id: data.optionId },
                    data: data.payload,
                });
            });
        }

        if (isCorrect === false) {
            // Rule: Prevent un-checking the last correct answer.
            if (currentOption.isCorrect) {
                const correctCount = await this.prisma.option.count({
                    where: {
                        questionId: data.questionId,
                        isCorrect: true,
                    },
                });

                if (correctCount <= 1) {
                    throw new BadRequestException(
                        "Cannot un-check the only correct answer. Select another answer as correct first.",
                    );
                }
            }
        }

        // Default update (for text changes or 'isCorrect: false')
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
        // 1. Validate ownership and get the option to be deleted
        const optionToDelete = await this.validateOwnership(data);

        // 2. Rule: Check for minimum 2 options
        const question = await this.prisma.question.findUnique({
            where: { id: data.questionId },
            include: { _count: { select: { options: true } } },
        });

        if (!question) throw new NotFoundException("Question not found");

        if (question._count.options <= 2) {
            throw new BadRequestException(
                "Cannot delete option. A question must have at least 2 options.",
            );
        }

        // 3. Rule: Check if deleting the correct answer,
        // if yes, make another option correct and delete it
        if (optionToDelete.isCorrect) {
            return this.prisma.$transaction(async (tx) => {
                // a. Find the first available option that is NOT the one being deleted
                const nextCorrectOption = await tx.option.findFirst({
                    where: {
                        questionId: data.questionId,
                        NOT: { id: data.optionId },
                    },
                    orderBy: {
                        sortOrder: "asc",
                    },
                });

                if (!nextCorrectOption) {
                    throw new Error(
                        "Failed to find a replacement correct option.",
                    );
                }

                // b. Set it as the new correct answer
                await tx.option.update({
                    where: { id: nextCorrectOption.id },
                    data: { isCorrect: true },
                });

                // c. Delete the original option
                return tx.option.delete({
                    where: {
                        id: data.optionId,
                    },
                });
            });
        }

        // 4. All checks passed (or it wasn't the correct answer), proceed with simple delete
        return this.prisma.option.delete({
            where: {
                id: data.optionId,
            },
        });
    }
}
