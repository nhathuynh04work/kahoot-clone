import { apiClient } from "@/lib/apiClient";

export interface GeneratedOption {
	text: string;
	isCorrect: boolean;
}

export interface GeneratedQuestion {
	text: string;
	options: GeneratedOption[];
}

type QuestionSourceMode = "rag" | "freestyle";

type RagContextRelevance = "matched" | "mismatch_no_relevant_info";

export interface GenerateQuestionsMeta {
	mode: QuestionSourceMode;
	ragContextRelevance?: RagContextRelevance;
	note?: string;
}

export interface GenerateQuestionsResponse {
	questions: GeneratedQuestion[];
	meta?: GenerateQuestionsMeta;
}

export const generateQuestions = async (
	prompt: string,
	documentId?: number | null,
): Promise<GenerateQuestionsResponse> => {
	const { data } = await apiClient.post<GenerateQuestionsResponse>(
		"/ai/generate-questions",
		{ prompt, documentId: documentId ?? undefined },
		{ timeout: 60_000 },
	);
	return data;
};
