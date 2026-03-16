import { apiClient } from "@/lib/apiClient";

export interface GeneratedOption {
	text: string;
	isCorrect: boolean;
}

export interface GeneratedQuestion {
	text: string;
	options: GeneratedOption[];
}

export interface GenerateQuestionsResponse {
	questions: GeneratedQuestion[];
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
