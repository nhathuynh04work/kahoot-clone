import { Injectable } from "@nestjs/common";
import { DocumentParser } from "./document-parser.interface";

@Injectable()
export class TxtParser implements DocumentParser {
    supports(contentType: string, fileUrl: string): boolean {
        return (
            contentType.includes("text/plain") ||
            fileUrl.toLowerCase().endsWith(".txt")
        );
    }

    async parse(response: Response): Promise<string> {
        return response.text();
    }
}
