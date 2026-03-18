import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { QuizService } from "./quiz.service.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { UpdateQuizDto } from "./dto/update-quiz.dto.js";

@Controller("quiz")
@UseGuards(JwtHttpGuard)
export class QuizController {
    constructor(private quizService: QuizService) {}

    @Get("/:id")
    getQuiz(@Param("id", ParseIntPipe) id: number, @User() user: JwtUser) {
        return this.quizService.getQuiz(id, user.id);
    }

    @Get()
    getQuizzes(
        @User() user: JwtUser,
        @Query("q") q?: string,
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        const hasQueryPaging =
            (q && q.trim().length > 0) || page !== undefined || pageSize !== undefined;

        if (!hasQueryPaging) {
            return this.quizService.getQuizzes(user.id);
        }

        return this.quizService.getQuizPage(user.id, {
            q: q?.trim() ? q.trim() : undefined,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
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
