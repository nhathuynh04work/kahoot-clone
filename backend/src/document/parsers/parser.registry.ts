import { Injectable, BadRequestException } from "@nestjs/common";
import { DocumentParser } from "./document-parser.interface";
import { TxtParser } from "./txt.parser";
import { PdfParser } from "./pdf.parser";

@Injectable()
export class ParserRegistry {
    private readonly parsers: DocumentParser[];

    constructor(
        txtParser: TxtParser,
        pdfParser: PdfParser,
    ) {
        this.parsers = [txtParser, pdfParser];
    }

    resolve(contentType: string, fileUrl: string): DocumentParser {
        const parser = this.parsers.find((p) => p.supports(contentType, fileUrl));
        if (!parser) {
            throw new BadRequestException(
                `Unsupported document type: ${contentType || "unknown"}. Use PDF or TXT.`,
            );
        }
        return parser;
    }
}
