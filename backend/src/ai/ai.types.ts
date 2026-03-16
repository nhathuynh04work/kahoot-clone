export interface GeneratedOption {
    text: string;
    isCorrect: boolean;
}

export interface GeneratedQuestion {
    text: string;
    options: GeneratedOption[];
}

export type QuestionSourceMode = "rag" | "freestyle";

export type RagContextRelevance = "matched" | "mismatch_no_relevant_info";

export interface GenerateQuestionsMeta {
    /**
     * High-level generation mode:
     * - "rag": questions are grounded in a specific document
     * - "freestyle": questions are generated from the model's own knowledge
     */
    mode: QuestionSourceMode;

    /**
     * For RAG generations, describes how well the user's request matches the document content.
     * - "matched": the document contains relevant information for the user's request
     * - "mismatch_no_relevant_info": the user's request topic is not meaningfully covered in the document
     */
    ragContextRelevance?: RagContextRelevance;

    /**
     * Optional short, user-facing note that the UI can surface directly
     * to explain how the questions were generated.
     *
     * Examples:
     * - "Generated from your uploaded document."
     * - "Your request was about dolphins but the document is about an online library system, so questions are about the document instead."
     */
    note?: string;
}

export interface GenerateQuestionsResult {
    questions: GeneratedQuestion[];
    meta?: GenerateQuestionsMeta;
}

