import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable, Subscriber } from "rxjs";
import { GoogleGenAI } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v2 as cloudinary } from "cloudinary";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentStatus } from "../generated/prisma/client";
import { ParserRegistry } from "./parsers/parser.registry";

const CHUNK_SIZE = 4000;
const CHUNK_OVERLAP = 800;
const EMBED_BATCH_SIZE = 20;
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_MODEL = "gemini-embedding-001";
const MIN_CHUNKS_FOR_RAG = 3;
const MAX_CHUNKS = 200;

export interface ProgressEvent {
    stage: string;
    progress: number;
}

@Injectable()
export class DocumentProcessingService {
    private readonly logger = new Logger(DocumentProcessingService.name);
    private readonly genai: GoogleGenAI | null = null;

    constructor(
        private prisma: PrismaService,
        private parserRegistry: ParserRegistry,
        config: ConfigService,
    ) {
        const apiKey = config.get<string>("GEMINI_API_KEY");
        if (apiKey) {
            this.genai = new GoogleGenAI({ apiKey });
        }

        cloudinary.config({
            cloud_name: config.get<string>("CLOUDINARY_CLOUD_NAME"),
            api_key: config.get<string>("CLOUDINARY_API_KEY"),
            api_secret: config.get<string>("CLOUDINARY_API_SECRET"),
        });
    }

    parseAndIndexDocument(
        documentId: number,
        userId: number,
    ): Observable<ProgressEvent> {
        return new Observable<ProgressEvent>((subscriber) => {
            this.processDocument(documentId, userId, subscriber)
                .then(() => subscriber.complete())
                .catch((err) => subscriber.error(err));
        });
    }

    private async processDocument(
        documentId: number,
        userId: number,
        subscriber: Subscriber<ProgressEvent>,
    ): Promise<void> {
        const genai = this.genai;
        if (!genai) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!doc) {
            throw new BadRequestException("Document not found");
        }

        await this.updateStatus(documentId, DocumentStatus.PARSING);
        subscriber.next({ stage: "Starting...", progress: 5 });

        try {
            // Fetch doc
            const response = await this.fetchDocument(doc.fileUrl, doc.cloudinaryPublicId);

            // Parse doc
            const contentType = (response.headers.get("content-type") || doc.mimeType || "").toLowerCase();
            const parser = this.parserRegistry.resolve(contentType, doc.fileUrl);
            const text = await parser.parse(response);
            this.logger.log(`[doc ${documentId}] Parsed text: ${text.length} chars`);
            subscriber.next({ stage: "Extracting text...", progress: 20 });

            // Chunk doc
            const chunks = await this.chunkText(text);
            this.logger.log(`[doc ${documentId}] Chunked into ${chunks.length} chunks`);
            subscriber.next({ stage: "Generating chunks...", progress: 35 });

            // Validate chunks
            this.validateChunks(chunks);

            // Embed chunks
            const embeddings = await this.embedChunks(genai, chunks, subscriber);
            this.logger.log(`[doc ${documentId}] Embedded ${embeddings.length} chunks`);

            // Store chunks
            subscriber.next({ stage: "Storing embeddings...", progress: 85 });
            await this.storeChunks(documentId, chunks, embeddings);

            // Processing done
            await this.updateStatus(documentId, DocumentStatus.READY);
            subscriber.next({ stage: "Done", progress: 100 });
            this.logger.log(`[doc ${documentId}] Indexing complete`);
        } catch (err) {
            this.logger.warn(
                `[doc ${documentId}] Indexing failed: ${err instanceof Error ? err.message : String(err)}`,
            );
            await this.updateStatus(documentId, DocumentStatus.ERROR);
            throw err;
        }
    }

    private async updateStatus(documentId: number, status: DocumentStatus): Promise<void> {
        await this.prisma.document.update({
            where: { id: documentId },
            data: { status },
        });
    }

    private async fetchDocument(fileUrl: string, cloudinaryPublicId?: string | null): Promise<Response> {
        const url = cloudinaryPublicId
            ? this.getCloudinaryDownloadUrl(cloudinaryPublicId)
            : fileUrl;

        const res = await fetch(url, {
            headers: { "User-Agent": "KahootClone-Backend/1.0", Accept: "*/*" },
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch document: ${res.status} (${res.statusText})`);
        }
        return res;
    }

    private getCloudinaryDownloadUrl(publicId: string): string {
        const format = publicId.includes(".")
            ? publicId.split(".").pop()!.toLowerCase()
            : "pdf";

        return cloudinary.utils.private_download_url(publicId, format, {
            resource_type: "raw",
            type: "upload",
        });
    }

    private async chunkText(text: string): Promise<string[]> {
        if (!text.trim()) {
            throw new Error("No text could be extracted from the document");
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: CHUNK_SIZE,
            chunkOverlap: CHUNK_OVERLAP,
        });
        const chunks = await splitter.splitText(text);
        return chunks.filter((c) => c.trim().length > 0);
    }

    private validateChunks(chunks: string[]): void {
        if (chunks.length === 0) {
            throw new Error("Document produced no chunks");
        }

        if (chunks.length < MIN_CHUNKS_FOR_RAG) {
            throw new Error(
                `Document has too few chunks (${chunks.length}). At least ${MIN_CHUNKS_FOR_RAG} required for RAG quiz generation.`,
            );
        }

        if (chunks.length > MAX_CHUNKS) {
            throw new Error(
                `Document is too large to process (${chunks.length} text chunks, max ${MAX_CHUNKS}). Try a shorter document or split it into parts.`,
            );
        }
    }

    private async embedChunks(
        genai: GoogleGenAI,
        chunks: string[],
        subscriber: Subscriber<ProgressEvent>,
    ): Promise<number[][]> {
        const batches = this.toBatches(chunks, EMBED_BATCH_SIZE);
        const results: number[][] = [];

        for (const [idx, batch] of batches.entries()) {
            const pct = 35 + Math.round((idx / batches.length) * 45);
            subscriber.next({ stage: "Indexing content...", progress: Math.min(pct, 80) });

            const response = await genai.models.embedContent({
                model: EMBEDDING_MODEL,
                contents: batch,
                config: {
                    taskType: "RETRIEVAL_DOCUMENT",
                    outputDimensionality: EMBEDDING_DIMENSIONS,
                },
            });

            results.push(...this.extractEmbeddings(response.embeddings));
        }

        return results;
    }

    private toBatches<T>(items: T[], size: number): T[][] {
        return Array.from(
            { length: Math.ceil(items.length / size) },
            (_, i) => items.slice(i * size, i * size + size),
        );
    }

    private extractEmbeddings(
        embeddings?: Array<{ values?: number[] }>,
    ): number[][] {
        return (embeddings ?? []).map((emb) => {
            if (emb.values?.length !== EMBEDDING_DIMENSIONS) {
                throw new Error(
                    `Unexpected embedding dimension: ${emb.values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`,
                );
            }
            return emb.values;
        });
    }

    private async storeChunks(
        documentId: number,
        chunks: string[],
        embeddings: number[][],
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
                DELETE FROM "DocumentChunk" WHERE "documentId" = ${documentId}
            `;

            for (let i = 0; i < chunks.length; i++) {
                const embeddingStr = `[${embeddings[i].join(",")}]`;
                await tx.$executeRaw`
                    INSERT INTO "DocumentChunk" ("documentId", "content", "chunkIndex", "embedding")
                    VALUES (${documentId}, ${chunks[i]}, ${i}, ${embeddingStr}::vector)
                `;
            }
        });
    }
}
