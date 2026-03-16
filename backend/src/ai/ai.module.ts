import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AiClient } from "./ai.client";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [AiController],
    providers: [AiService, AiClient],
    exports: [AiService, AiClient],
})
export class AiModule {}
