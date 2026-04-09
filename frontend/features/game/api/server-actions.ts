"use server";

import { Quiz } from "@/features/quizzes/types";
import { apiServer } from "@/lib/apiServer";
import { GameLobby, Player } from "../types";

export type SessionListItem = {
	lobbyId: number;
	quizId: number;
	quizTitle: string;
	createdAt: string;
	endedAt: string | null;
	totalPlayers: number;
	avgAccuracy: number;
};

export type RecentSessionsResponse = {
	items: SessionListItem[];
	nextCursor: number | null;
};

export type ReportSort =
	| "endedAt_desc"
	| "endedAt_asc"
	| "players_desc"
	| "players_asc"
	| "accuracy_desc"
	| "accuracy_asc";

export type ReportPageResponse = {
	items: SessionListItem[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function getRecentSessions(options?: {
	limit?: number;
	cursor?: number;
}): Promise<RecentSessionsResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	if (options?.limit) params.set("limit", String(options.limit));
	if (options?.cursor) params.set("cursor", String(options.cursor));
	const { data } = await api.get(`/game/report?${params.toString()}`);
	return data;
}

export async function getReportPage(options: {
	page: number;
	pageSize: number;
	q?: string;
	sort?: ReportSort;
}): Promise<ReportPageResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q) params.set("q", options.q);
	if (options.sort) params.set("sort", options.sort);
	const { data } = await api.get(`/game/report/page?${params.toString()}`);
	return data;
}

export type SessionReport = {
	session: {
		lobbyId: number;
		quizId: number;
		quizTitle: string;
		hostId: number;
		createdAt: string;
		endedAt: string | null;
	};
	aggregates: {
		totalPlayers: number;
		totalQuestions: number;
		totalAnswers: number;
		totalCorrect: number;
		totalIncorrect: number;
		avgAccuracy: number;
	};
	questions: Array<{
		questionId: number;
		sortIndex: number;
		correctCount: number;
		incorrectCount: number;
		correctRate: number;
		breakdown?: Record<string, unknown> | null;
		question?: {
			id: number;
			text: string | null;
			imageUrl: string | null;
			type?: string;
			options: Array<{
				id: number;
				text: string | null;
				isCorrect: boolean;
				sortOrder: number;
			}>;
		};
	}>;
	players: Array<{
		playerId: number;
		nickname: string;
		answeredCount: number;
		correctCount: number;
		accuracy: number;
		finalScore: number;
	}>;
	leaderboard: Array<{ nickname: string; points: number }>;
};

export async function getSessionReport(lobbyId: number): Promise<SessionReport> {
	const api = await apiServer();
	const { data } = await api.get(`/game/report/${lobbyId}`);
	return data;
}

export async function getSessionsForQuiz(
	quizId: number
): Promise<SessionListItem[]> {
	const api = await apiServer();
	const { data } = await api.get(`/game/report/quiz/${quizId}`);
	return data;
}

export async function getValidLobby(
	pin: string
): Promise<GameLobby & { quiz: Quiz }> {
	const api = await apiServer();
	const { data } = await api.get(`/game/lobby?pin=${pin}`);
	return data;
}

export async function registerPlayer(
	nickname: string,
	pin: string
): Promise<Player> {
	const api = await apiServer();
	const { data } = await api.post(`/game/player`, { nickname, pin });
	return data;
}
