"use server";

import { apiServer } from "@/lib/apiServer";
import { QuizFullDetails, QuizWithQuestions } from "../types";

export async function getQuiz(id: string) {
	const api = await apiServer();
	const { data } = await api.get(`/quiz/${id}`);
	return data as QuizFullDetails;
}

export async function getQuizzes() {
	const api = await apiServer();
	const { data } = await api.get("/quiz");
	return data as QuizWithQuestions[];
}
