import { Injectable } from "@nestjs/common";
import { DocumentParser } from "./document-parser.interface";

@Injectable()
export class PdfParser implements DocumentParser {
    supports(contentType: string, fileUrl: string): boolean {
        return (
            contentType.includes("pdf") ||
            fileUrl.toLowerCase().endsWith(".pdf")
        );
    }

    async parse(response: Response): Promise<string> {
        const buffer = Buffer.from(await response.arrayBuffer());
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        try {
            const result = await parser.getText();
            return result?.text ?? "";
        } finally {
            await parser.destroy();
        }
    }
}
