import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v2 as cloudinary } from "cloudinary";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentStatus } from "../generated/prisma/client";

/** ~1000 tokens ≈ 4000 chars, ~200 token overlap ≈ 800 chars (rough English estimate) */
const CHUNK_SIZE = 4000;
const CHUNK_OVERLAP = 800;

/** Max chunks to embed in a single API call to stay under limits */
const EMBED_BATCH_SIZE = 20;

/** Match Cloudinary raw URL to extract public_id: /raw/upload/v{version}/{public_id} */
const CLOUDINARY_RAW_REGEX =
    /res\.cloudinary\.com\/[^/]+\/raw\/upload\/v\d+\/(.+)$/;

@Injectable()
export class DocumentProcessingService {
    private readonly logger = new Logger(DocumentProcessingService.name);
    private readonly genai: GoogleGenAI | null = null;

    constructor(
        private prisma: PrismaService,
        config: ConfigService,
    ) {
        const apiKey = config.get<string>("GEMINI_API_KEY");
        if (apiKey) {
            this.genai = new GoogleGenAI({ apiKey });
        }
        // Configure Cloudinary so signed URLs work when we fetch raw files (api_secret required for signing).
        cloudinary.config({
            cloud_name: config.get<string>("CLOUDINARY_CLOUD_NAME"),
            api_key: config.get<string>("CLOUDINARY_API_KEY"),
            api_secret: config.get<string>("CLOUDINARY_API_SECRET"),
        });
    }

    /**
     * Fetch document from URL, parse text, chunk, embed, and store in DocumentChunk.
     * Updates document status: PARSING → READY or ERROR.
     */
    async parseAndIndexDocument(documentId: number, userId: number): Promise<void> {
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!doc) {
            throw new BadRequestException("Document not found");
        }

        await this.prisma.document.update({
            where: { id: documentId },
            data: { status: DocumentStatus.PARSING },
        });

        try {
            const text = await this.fetchAndParse(doc.fileUrl, doc.mimeType);
            this.logger.log(
                `[doc ${documentId}] Parsed text: ${text.length} chars`,
            );

            if (!text?.trim()) {
                throw new Error("No text could be extracted from the document");
            }

            const chunks = await this.chunkText(text);
            this.logger.log(
                `[doc ${documentId}] Chunked into ${chunks.length} chunks`,
            );

            if (chunks.length === 0) {
                throw new Error("Document produced no chunks");
            }

            if (!this.genai) {
                throw new Error("GEMINI_API_KEY is not configured");
            }

            const embeddings = await this.embedChunks(chunks);
            this.logger.log(
                `[doc ${documentId}] Embedded ${embeddings.length} chunks`,
            );

            await this.prisma.$transaction(async (tx) => {
                await tx.$executeRaw`
                    DELETE FROM "DocumentChunk"
                    WHERE "documentId" = ${documentId}
                `;

                for (let i = 0; i < chunks.length; i++) {
                    const embeddingStr = `[${embeddings[i].join(",")}]`;
                    await tx.$executeRaw`
                        INSERT INTO "DocumentChunk" ("documentId", "content", "chunkIndex", "embedding")
                        VALUES (${documentId}, ${chunks[i]}, ${i}, ${embeddingStr}::vector)
                    `;
                }
            });

            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: DocumentStatus.READY },
            });
            this.logger.log(`[doc ${documentId}] Indexing complete, status READY`);
        } catch (err) {
            this.logger.warn(
                `[doc ${documentId}] Indexing failed: ${err instanceof Error ? err.message : String(err)}`,
            );
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: DocumentStatus.ERROR },
            });
            throw err;
        }
    }

    /** Fetch file from URL and extract raw text. Uses signed URL for Cloudinary to avoid 401. */
    private async fetchAndParse(fileUrl: string, mimeType: string): Promise<string> {
        const fetchUrl = this.toFetchableUrl(fileUrl);
        const res = await fetch(fetchUrl, {
            headers: {
                "User-Agent": "KahootClone-Backend/1.0",
                Accept: "*/*",
            },
        });
        if (!res.ok) {
            throw new Error(
                `Failed to fetch document: ${res.status} (${res.statusText})`,
            );
        }

        const contentType = (res.headers.get("content-type") || mimeType || "").toLowerCase();

        if (contentType.includes("text/plain") || fileUrl.endsWith(".txt")) {
            return res.text();
        }

        if (contentType.includes("pdf") || fileUrl.toLowerCase().endsWith(".pdf")) {
            const buffer = Buffer.from(await res.arrayBuffer());
            const { PDFParse } = await import("pdf-parse");
            const parser = new PDFParse({ data: buffer });
            try {
                const result = await parser.getText();
                return result?.text ?? "";
            } finally {
                await parser.destroy();
            }
        }

        throw new BadRequestException(
            `Unsupported document type: ${contentType || "unknown"}. Use PDF or TXT.`,
        );
    }

    /**
     * For Cloudinary URLs, use the API private_download_url so the backend can fetch
     * the file with signed params (avoids 401 from CDN signed URLs for raw).
     * For other URLs, return as-is.
     */
    private toFetchableUrl(fileUrl: string): string {
        const m = fileUrl.match(CLOUDINARY_RAW_REGEX);
        if (!m) {
            return fileUrl;
        }
        const publicId = decodeURIComponent(m[1]);
        const format = publicId.includes(".")
            ? publicId.split(".").pop()!.toLowerCase()
            : "pdf";
        const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
            resource_type: "raw",
            type: "upload",
        });
        this.logger.debug(
            `Resolved Cloudinary private_download_url for public_id=${publicId}`,
        );
        return signedUrl;
    }

    /** Split text into semantically meaningful chunks. */
    private async chunkText(text: string): Promise<string[]> {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: CHUNK_SIZE,
            chunkOverlap: CHUNK_OVERLAP,
        });
        const chunks = await splitter.splitText(text);
        return chunks.filter((c) => c.trim().length > 0);
    }

    /** Get embeddings for chunks via Gemini API (gemini-embedding-001, 768 dimensions to match DB). */
    private async embedChunks(chunks: string[]): Promise<number[][]> {
        const results: number[][] = [];

        for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
            const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
            const response = await this.genai!.models.embedContent({
                model: "gemini-embedding-001",
                contents: batch,
                config: {
                    taskType: "RETRIEVAL_DOCUMENT",
                    outputDimensionality: 768,
                },
            });

            const embeddings = response.embeddings ?? [];
            for (const emb of embeddings) {
                const values = emb.values;
                if (values && values.length === 768) {
                    results.push(values);
                } else {
                    throw new Error(
                        `Unexpected embedding dimension: ${values?.length ?? 0}, expected 768`,
                    );
                }
            }
        }

        return results;
    }
}
