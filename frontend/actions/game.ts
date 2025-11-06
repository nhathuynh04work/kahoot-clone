import { apiServer } from "@/lib/apiServer";
import { GameLobby } from "@/lib/types/game";
import { Quiz } from "@/lib/types/quiz";

export async function getValidLobby(
	pin: string
): Promise<GameLobby & { quiz: Quiz }> {
	const api = await apiServer();
	const { data } = await api.get(`/game/validate-pin?pin=${pin}`);
	return data;
}
