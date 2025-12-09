import { Module } from "@nestjs/common";
import { QuestionService } from "./question.service.js";
import { UserModule } from "../user/user.module.js";
import { QuizModule } from "../quiz/quiz.module.js";

@Module({
    imports: [UserModule, QuizModule],
    providers: [QuestionService],
    exports: [QuestionService],
})
export class QuestionModule {}
