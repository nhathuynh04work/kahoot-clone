import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuizModule } from "./quiz/quiz.module";
import { GameModule } from "./game/game.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";
import { UploadModule } from "./upload/upload.module";
import { DocumentModule } from "./document/document.module";
import { AiModule } from "./ai/ai.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        AuthModule,
        UserModule,
        PrismaModule,
        QuizModule,
        GameModule,
        RedisModule,
        UploadModule,
        DocumentModule,
        AiModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
