export interface GameLobby {
	id: number;
	pin: string;
	quizId: number;
	hostId: number;
	status: LobbyStatus;
	createdAt: Date;
}

export enum LobbyStatus {
	WAITING,
	IN_PROGRESS,
	FINISHED,
	CLOSED,
}
