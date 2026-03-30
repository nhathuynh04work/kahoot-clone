import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from "@nestjs/common";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { SavesService } from "./saves.service.js";

@Controller("saves")
@UseGuards(JwtHttpGuard)
export class SavesController {
    constructor(private savesService: SavesService) {}

    @Post("quizzes/:quizId")
    toggleQuizSave(
        @Param("quizId", ParseIntPipe) quizId: number,
        @User() user: JwtUser,
    ) {
        return this.savesService.toggleQuizSave(user.id, quizId);
    }

    @Post("documents/:documentId")
    toggleDocumentSave(
        @Param("documentId", ParseIntPipe) documentId: number,
        @User() user: JwtUser,
    ) {
        return this.savesService.toggleDocumentSave(user.id, documentId);
    }

    @Get("quizzes")
    async getMySavedQuizzes(@User() user: JwtUser) {
        const quizIds = await this.savesService.getMySavedQuizIds(user.id);
        return { quizIds };
    }

    @Get("documents")
    async getMySavedDocuments(@User() user: JwtUser) {
        const documentIds = await this.savesService.getMySavedDocumentIds(user.id);
        return { documentIds };
    }

    @Get("quizzes/public")
    getMySavedPublicQuizzes(@User() user: JwtUser) {
        return this.savesService.getMySavedPublicQuizzes(user.id);
    }

    @Get("documents/public")
    getMySavedPublicDocuments(@User() user: JwtUser) {
        return this.savesService.getMySavedPublicDocuments(user.id);
    }
}

