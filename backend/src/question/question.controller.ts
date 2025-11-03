import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { QuestionService } from "./question.service.js";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { UpdateQuestionDto } from "./dto/update-question.dto.js";

@UseGuards(JwtAuthGuard)
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
}
