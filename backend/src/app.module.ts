import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { CacheModule } from "@nestjs/cache-manager";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuizModule } from "./quiz/quiz.module";
import { QuestionModule } from "./question/question.module";
import { GameModule } from "./game/game.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisOptions } from "./config/redis";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.registerAsync(RedisOptions),
        EventEmitterModule.forRoot(),
        AuthModule,
        UserModule,
        PrismaModule,
        QuizModule,
        QuestionModule,
        GameModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
