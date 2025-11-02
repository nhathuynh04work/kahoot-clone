import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from "@nestjs/common";
import { QuizService } from "./quiz.service.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard.js";
import { Quiz } from "../../generated/prisma/client.js";

@Controller("quizzes")
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
}
