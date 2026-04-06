import { apiClient } from "@/lib/apiClient";

export interface GeneratedMcOption {
	text: string;
	isCorrect: boolean;
}

export type GeneratedQuestion =
	| {
			type: "MULTIPLE_CHOICE";
			text: string;
			options: GeneratedMcOption[];
			onlyOneCorrect?: boolean;
	  }
	| {
			type: "TRUE_FALSE";
			text: string;
			correctIsTrue: boolean;
	  }
	| {
			type: "SHORT_ANSWER";
			text: string;
			correctText: string;
	  }
	| {
			type: "NUMBER_INPUT";
			text: string;
			correctNumber: number;
			rangeProximity: number;
	  };

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
	quizId?: number | null,
): Promise<GenerateQuestionsResponse> => {
	const { data } = await apiClient.post<GenerateQuestionsResponse>(
		"/ai/generate-questions",
		{
			prompt,
			documentId: documentId ?? undefined,
			quizId: quizId ?? undefined,
		},
		{ timeout: 60_000 },
	);
	return data;
};

export interface QuizChatMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
	attachedDocument?: { id: number; fileName: string };
	generatedCount?: number;
	generatedQuestions?: GeneratedQuestion[];
}

export interface GetQuizChatResponse {
	messages: QuizChatMessage[];
}

export const getQuizChat = async (quizId: number): Promise<GetQuizChatResponse> => {
	const { data } = await apiClient.get<GetQuizChatResponse>(`/ai/quiz/${quizId}/chat`);
	return data;
};
