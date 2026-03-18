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

export async function getRecentSessions(options?: {
	limit?: number;
	cursor?: number;
}): Promise<RecentSessionsResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	if (options?.limit) params.set("limit", String(options.limit));
	if (options?.cursor) params.set("cursor", String(options.cursor));
	const { data } = await api.get(`/game/history?${params.toString()}`);
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
		optionCounts: Record<string, number>;
		question?: { id: number; text: string | null; options: Array<{ id: number; text: string | null }> };
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
	const { data } = await api.get(`/game/history/${lobbyId}`);
	return data;
}

export async function getSessionsForQuiz(
	quizId: number
): Promise<SessionListItem[]> {
	const api = await apiServer();
	const { data } = await api.get(`/game/history/quiz/${quizId}`);
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

export async function createLobby(quizId: number) {
	const api = await apiServer();
	const { data } = await api.post(`/game/lobby`, { quizId });
	return data as GameLobby;
}
