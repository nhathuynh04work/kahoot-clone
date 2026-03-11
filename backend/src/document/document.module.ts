import { Module } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { DocumentProcessingService } from "./document-processing.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";

@Module({
    imports: [PrismaModule, UploadModule],
    controllers: [DocumentController],
    providers: [DocumentService, DocumentProcessingService],
    exports: [DocumentService, DocumentProcessingService],
})
export class DocumentModule {}
