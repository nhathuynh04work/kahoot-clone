import { apiClient as api } from "@/lib/apiClient";
import { Quiz, QuizFullDetails } from "../types";

export const createQuiz = async () => {
	const { data } = await api.post("/quiz");
	return data as Quiz;
};

export const updateQuiz = async (payload: QuizFullDetails) => {
	console.log("saved");
	// const { data } = await api.patch(`/quiz/${payload.id}`, payload);
	// return data as QuizFullDetails;
};
