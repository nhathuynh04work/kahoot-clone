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

export async function getPublicQuiz(id: string) {
	const api = await apiServer();
	const { data } = await api.get(`/public/quizzes/${id}`);
	return data;
}

export type QuizPageResponse = {
	items: QuizWithQuestions[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export type PublicQuizPageResponse = Omit<QuizPageResponse, "items"> & {
	items: Array<QuizWithQuestions & { saveCount?: number; playCount?: number }>;
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

export async function searchPublicQuizzes(options: {
	mode: "recent" | "mostPlayed" | "mostSaved";
	page: number;
	pageSize: number;
}) {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("mode", options.mode);
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	const { data } = await api.get(`/public/quizzes?${params.toString()}`);
	return data as PublicQuizPageResponse;
}

export async function searchPublicQuizzesByUserId(
	userId: number,
	options: { mode: "recent" | "mostPlayed" | "mostSaved"; page: number; pageSize: number },
) {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("mode", options.mode);
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));

	const { data } = await api.get(
		`/public/users/${userId}/quizzes?${params.toString()}`,
	);
	return data as PublicQuizPageResponse;
}

export async function toggleQuizSaveServer(quizId: number) {
	const api = await apiServer();
	const { data } = await api.post(`/saves/quizzes/${quizId}`);
	return data as { saved: boolean; quizId: number };
}

export async function getMySavedPublicQuizzes() {
	const api = await apiServer();
	const { data } = await api.get("/saves/quizzes/public");
	return data as Array<QuizWithQuestions & { saveCount?: number; authorName?: string | null }>;
}
