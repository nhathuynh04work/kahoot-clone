export interface GameLobby {
	id: number;
	pin: string;
	quizId: number;
	hostId: number;
	status: LobbyStatus;
	createdAt: Date;
}

export type LobbyStatus = "WAITING" | "IN_PROGRESS" | "FINISHED" | "CLOSED";

export type GameState = "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";

export interface Player {
	id: string;
	nickname: string;
	isHost?: boolean;
	score?: number;
}
