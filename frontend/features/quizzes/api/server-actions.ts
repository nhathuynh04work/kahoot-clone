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

export type QuizPageResponse = {
	items: QuizWithQuestions[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function searchQuizzes(options: {
	q?: string;
	sort?: string;
	page: number;
	pageSize: number;
}): Promise<QuizPageResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.sort?.trim()) params.set("sort", options.sort.trim());
	const { data } = await api.get(`/quiz?${params.toString()}`);
	return data;
}
