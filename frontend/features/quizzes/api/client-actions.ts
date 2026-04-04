import { apiClient as api } from "@/lib/apiClient";
import { Quiz, QuizFullDetails } from "../types";

export const createQuiz = async () => {
	const { data } = await api.post("/quiz");
	return data as Quiz;
};

export const updateQuiz = async (payload: QuizFullDetails) => {
	const { data } = await api.patch(`/quiz/${payload.id}`, payload);
	return data as QuizFullDetails;
};

export const toggleQuizSave = async (quizId: number) => {
	const { data } = await api.post(`/saves/quizzes/${quizId}`);
	return data as { saved: boolean; quizId: number };
};

export const getMySavedQuizIds = async (): Promise<number[]> => {
	const { data } = await api.get<{ quizIds: number[] }>("/saves/quizzes");
	return data.quizIds;
};
