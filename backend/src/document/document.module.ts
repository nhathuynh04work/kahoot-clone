import { Module } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { DocumentProcessingService } from "./document-processing.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";
import { TxtParser } from "./parsers/txt.parser";
import { PdfParser } from "./parsers/pdf.parser";
import { ParserRegistry } from "./parsers/parser.registry";
import { AiModule } from "../ai/ai.module";
import { EntitlementsModule } from "../entitlements/entitlements.module";

@Module({
    imports: [PrismaModule, UploadModule, AiModule, EntitlementsModule],
    controllers: [DocumentController],
    providers: [TxtParser, PdfParser, ParserRegistry, DocumentService, DocumentProcessingService],
    exports: [DocumentService, DocumentProcessingService],
})
export class DocumentModule {}
