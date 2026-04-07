import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EntitlementService } from "./entitlement.service.js";

@Module({
    imports: [PrismaModule],
    providers: [EntitlementService],
    exports: [EntitlementService],
})
export class EntitlementsModule {}
