import { Module } from "@nestjs/common";
import { QuizController } from "./quiz.controller.js";
import { QuizService } from "./quiz.service.js";
import { UserModule } from "../user/user.module.js";

@Module({
    imports: [UserModule],
    controllers: [QuizController],
    providers: [QuizService],
})
export class QuizModule {}
