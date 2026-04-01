"use client";

import { apiClient } from "@/lib/apiClient";

export type GlobalSearchQuiz = {
	id: number;
	title: string | null;
	coverUrl: string | null;
	userId: number;
	authorName: string | null;
	questionCount: number;
	saveCount: number;
	playCount: number;
};

export type GlobalSearchDocument = {
	id: number;
	fileName: string;
	fileSize: number;
	userId: number;
	status: string;
	authorName: string | null;
	saveCount: number;
};

export type GlobalSearchUser = {
	id: number;
	name: string | null;
	avatarUrl: string | null;
};

export type GlobalSearchResponse = {
	quizzes: GlobalSearchQuiz[];
	documents: GlobalSearchDocument[];
	users: GlobalSearchUser[];
};

export async function globalSearch(args: { q: string; limit?: number }) {
	const params = new URLSearchParams();
	params.set("q", args.q);
	if (typeof args.limit === "number") params.set("limit", String(args.limit));
	const { data } = await apiClient.get<GlobalSearchResponse>(
		`/search?${params.toString()}`,
	);
	return data;
}

