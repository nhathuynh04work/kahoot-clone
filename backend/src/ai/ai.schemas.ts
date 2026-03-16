import { Type } from "@google/genai";
import type { Schema } from "@google/genai";

export const QUIZ_RESPONSE_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
                mode: { type: Type.STRING },
                ragContextRelevance: { type: Type.STRING },
                note: { type: Type.STRING },
            },
            required: ["mode"],
        },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                isCorrect: { type: Type.BOOLEAN },
                            },
                            required: ["text", "isCorrect"],
                        },
                    },
                },
                required: ["text", "options"],
            },
        },
    },
    required: ["questions"],
};
