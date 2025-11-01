import { Controller, Post, UseGuards } from "@nestjs/common";
import { QuizService } from "./quiz.service.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard.js";
import { Quiz } from "../../generated/prisma/client.js";

@Controller("quizzes")
export class QuizController {
    constructor(private quizService: QuizService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@User() user: JwtUser): Promise<Quiz> {
        return this.quizService.create(user.id);
    }
}
