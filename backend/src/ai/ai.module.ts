import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { EntitlementsModule } from "../entitlements/entitlements.module.js";
import { AiClient } from "./ai.client";
import { AiQuizChatService } from "./ai-quiz-chat.service";
import { AiChatRetentionJob } from "./ai-chat-retention.job";

@Module({
    imports: [PrismaModule, AuthModule, EntitlementsModule],
    controllers: [AiController],
    providers: [AiService, AiClient, AiQuizChatService, AiChatRetentionJob],
    exports: [AiService, AiClient, AiQuizChatService],
})
export class AiModule {}
