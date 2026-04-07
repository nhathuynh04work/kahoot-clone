import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BillingController } from "./billing.controller.js";
import { BillingService } from "./billing.service.js";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule {}
