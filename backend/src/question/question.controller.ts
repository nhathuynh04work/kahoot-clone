import {
    Body,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { QuestionService } from "./question.service.js";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { UpdateQuestionDto } from "./dto/update-question.dto.js";

@UseGuards(JwtHttpGuard)
@Controller("quiz/:quizId/questions")
export class QuestionController {
    constructor(private questionService: QuestionService) {}

    @Post()
    create(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
    ) {
        return this.questionService.create({ quizId, userId: user.id });
    }

    @Patch("/:questionId")
    update(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() payload: UpdateQuestionDto,
    ) {
        return this.questionService.update({
            questionId,
            quizId,
            userId: user.id,
            payload,
        });
    }

    @Delete("/:questionId")
    async delete(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
    ) {
        await this.questionService.delete({
            questionId,
            quizId,
            userId: user.id,
        });

        return { success: true };
    }
}
