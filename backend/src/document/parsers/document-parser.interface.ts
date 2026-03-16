export interface DocumentParser {
    /** Returns true if this parser can handle the given content type / file URL. */
    supports(contentType: string, fileUrl: string): boolean;

    /** Extracts plain text from the HTTP response body. */
    parse(response: Response): Promise<string>;
}
