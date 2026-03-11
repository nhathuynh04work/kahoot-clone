import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentProcessingService } from "./document-processing.service";
import type { JwtUser } from "../auth/user.decorator";
import { User } from "../auth/user.decorator";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { DocumentStatus } from "../generated/prisma/client";

@Controller("documents")
@UseGuards(JwtHttpGuard)
export class DocumentController {
    constructor(
        private documentService: DocumentService,
        private documentProcessingService: DocumentProcessingService,
    ) {}

    @Post()
    create(@Body() dto: CreateDocumentDto, @User() user: JwtUser) {
        return this.documentService.create(user.id, dto);
    }

    @Get()
    findAll(@User() user: JwtUser) {
        return this.documentService.findAll(user.id);
    }

    @Get("total-size")
    getTotalSize(@User() user: JwtUser) {
        return this.documentService.getTotalSize(user.id);
    }

    @Get(":id")
    findOne(@Param("id", ParseIntPipe) id: number, @User() user: JwtUser) {
        return this.documentService.findOne(id, user.id);
    }

    @Delete(":id")
    delete(@Param("id", ParseIntPipe) id: number, @User() user: JwtUser) {
        return this.documentService.delete(id, user.id);
    }

    @Patch(":id/status")
    updateStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: { status: DocumentStatus },
        @User() user: JwtUser,
    ) {
        return this.documentService.updateStatus(id, user.id, body.status);
    }

    @Post(":id/parse")
    async parse(
        @Param("id", ParseIntPipe) id: number,
        @User() user: JwtUser,
    ) {
        await this.documentProcessingService.parseAndIndexDocument(id, user.id);
        return { success: true };
    }
}
