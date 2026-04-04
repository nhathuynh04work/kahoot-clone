import { Module } from "@nestjs/common";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { SavesController } from "./saves.controller.js";
import { SavesService } from "./saves.service.js";

@Module({
    controllers: [SavesController],
    providers: [SavesService, JwtHttpGuard],
    exports: [SavesService],
})
export class SavesModule {}

