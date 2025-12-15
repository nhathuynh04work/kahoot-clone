"use server";

import { Quiz } from "@/features/quizzes/types";
import { apiServer } from "@/lib/apiServer";
import { GameLobby, Player } from "../types";

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
