import {
    Controller,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    UseGuards,
} from "@nestjs/common";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { SaveTargetType } from "../generated/prisma/client.js";
import { SavesService } from "./saves.service.js";

@Controller("saves")
@UseGuards(JwtHttpGuard)
export class SavesController {
    constructor(private savesService: SavesService) {}

    @Post(":targetType/:targetId")
    toggleSave(
        @Param("targetType", new ParseEnumPipe(SaveTargetType)) targetType: SaveTargetType,
        @Param("targetId", ParseIntPipe) targetId: number,
        @User() user: JwtUser,
    ) {
        return this.savesService.toggleSave(user.id, targetType, targetId);
    }

    @Get(":targetType")
    async getMySavedTargetIds(
        @Param("targetType", new ParseEnumPipe(SaveTargetType)) targetType: SaveTargetType,
        @User() user: JwtUser,
    ) {
        const ids = await this.savesService.getMySavedTargetIds(user.id, targetType);
        return { ids };
    }

    @Get(":targetType/public")
    getMySavedPublicTargets(
        @Param("targetType", new ParseEnumPipe(SaveTargetType)) targetType: SaveTargetType,
        @User() user: JwtUser,
    ) {
        return this.savesService.getMySavedPublicTargets(user.id, targetType);
    }
}

