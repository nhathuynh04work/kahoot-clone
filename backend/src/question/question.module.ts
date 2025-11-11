import { Module } from "@nestjs/common";
import { QuestionController } from "./question.controller.js";
import { QuestionService } from "./question.service.js";
import { UserModule } from "../user/user.module.js";
import { QuizModule } from "../quiz/quiz.module.js";

@Module({
    imports: [UserModule, QuizModule],
    controllers: [QuestionController],
    providers: [QuestionService],
    exports: [QuestionService],
})
export class QuestionModule {}
