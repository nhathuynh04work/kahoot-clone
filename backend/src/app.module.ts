import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuizModule } from "./quiz/quiz.module";
import { GameModule } from "./game/game.module";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";
import { UploadModule } from "./upload/upload.module";
import { DocumentModule } from "./document/document.module";
import { AiModule } from "./ai/ai.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SavesModule } from "./saves/saves.module";
import { PublicModule } from "./public/public.module";
import { SearchModule } from "./search/search.module";
import { BillingModule } from "./billing/billing.module.js";
import { EntitlementsModule } from "./entitlements/entitlements.module.js";

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
        AdminModule,
        RedisModule,
        UploadModule,
        DocumentModule,
        AiModule,
        SavesModule,
        PublicModule,
        SearchModule,
        EntitlementsModule,
        BillingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
