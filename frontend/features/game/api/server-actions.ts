"use server";

import { Quiz } from "@/features/quizzes/types";
import { apiServer } from "@/lib/apiServer";
import { GameLobby } from "../types";

export async function getValidLobby(
	pin: string
): Promise<GameLobby & { quiz: Quiz }> {
	const api = await apiServer();
	const { data } = await api.get(`/game/lobby?pin=${pin}`);
	return data;
}
