import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { QuizService } from "./quiz.service.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard.js";
import { UpdateQuizDto } from "./dto/update-quiz.dto.js";

@Controller("quiz")
@UseGuards(JwtAuthGuard)
export class QuizController {
    constructor(private quizService: QuizService) {}

    @Get("/:id")
    getQuiz(@Param("id", ParseIntPipe) id: number, @User() user: JwtUser) {
        return this.quizService.getQuiz(id, user.id);
    }

    @Get()
    getQuizzes(@User() user: JwtUser) {
        return this.quizService.getQuizzes(user.id);
    }

    @Post()
    create(@User() user: JwtUser) {
        return this.quizService.create(user.id);
    }

    @Patch("/:id")
    update(
        @Body() data: UpdateQuizDto,
        @Param("id", ParseIntPipe) id: number,
        @User() user: JwtUser,
    ) {
        return this.quizService.update({ id, userId: user.id, data });
    }

    @Delete("/:id")
    async delete(@Param("id", ParseIntPipe) id: number, @User() user: JwtUser) {
        await this.quizService.delete(id, user.id);
        return { success: true };
    }
}
