import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import type { Schema } from "@google/genai";
import {
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
    GENERATION_MODEL,
} from "./ai.constants";

@Injectable()
export class AiClient {
    private readonly genai: GoogleGenAI | null = null;

    constructor(config: ConfigService) {
        const apiKey = config.get<string>("GEMINI_API_KEY");
        if (apiKey) {
            this.genai = new GoogleGenAI({ apiKey });
        }
    }

    private getClientOrThrow(): GoogleGenAI {
        if (!this.genai) {
            throw new BadRequestException("GEMINI_API_KEY is not configured");
        }
        return this.genai;
    }

    async generateJsonContent(options: {
        systemPrompt: string;
        userMessage: string;
        responseMimeType?: string;
        responseSchema?: Schema;
    }): Promise<string> {
        const client = this.getClientOrThrow();
        const fullPrompt = `${options.systemPrompt}\n\n${options.userMessage}`;

        const response = await client.models.generateContent({
            model: GENERATION_MODEL,
            contents: fullPrompt,
            config: {
                responseMimeType: options.responseMimeType ?? "application/json",
                responseSchema: options.responseSchema,
            },
        });

        const text = response.text;
        if (!text?.trim()) {
            throw new Error("AI provider returned empty response");
        }

        return text.trim();
    }

    async embedQuery(text: string): Promise<number[]> {
        const [embedding] = await this.embedContents([text], "RETRIEVAL_QUERY");
        return embedding;
    }

    async embedContents(
        contents: string[],
        taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT",
    ): Promise<number[][]> {
        const client = this.getClientOrThrow();

        const response = await client.models.embedContent({
            model: EMBEDDING_MODEL,
            contents,
            config: {
                taskType,
                outputDimensionality: EMBEDDING_DIMENSIONS,
            },
        });

        const embeddings = response.embeddings ?? [];

        if (embeddings.length !== contents.length) {
            throw new Error(
                `Embedding count mismatch: expected ${contents.length}, got ${embeddings.length}`,
            );
        }

        return embeddings.map((emb) => {
            if (emb.values?.length !== EMBEDDING_DIMENSIONS) {
                throw new Error(
                    `Unexpected embedding dimension: ${emb.values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`,
                );
            }
            return emb.values;
        });
    }
}

