import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { UserModule } from "./user/user.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { QuizModule } from './quiz/quiz.module.js';
import { QuestionModule } from "./question/question.module.js";
import { OptionModule } from "./option/option.module.js";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UserModule,
        PrismaModule,
        QuizModule,
        QuestionModule,
        OptionModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
