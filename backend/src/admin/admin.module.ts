import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";
import { UserModule } from "../user/user.module.js";
import { AdminGuard } from "../auth/guard/admin.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BillingModule } from "../billing/billing.module.js";

@Module({
    imports: [UserModule, PrismaModule, BillingModule],
    controllers: [AdminController],
    providers: [AdminService, AdminGuard],
})
export class AdminModule {}

