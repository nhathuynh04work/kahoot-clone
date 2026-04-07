import { Module } from "@nestjs/common";
import { QuizController } from "./quiz.controller.js";
import { QuizService } from "./quiz.service.js";
import { UserModule } from "../user/user.module.js";
import { EntitlementsModule } from "../entitlements/entitlements.module.js";

@Module({
    imports: [UserModule, EntitlementsModule],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService],
})
export class QuizModule {}
