import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class QuestionService {
    constructor(private prisma: PrismaService) {}

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
