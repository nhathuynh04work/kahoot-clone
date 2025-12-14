export interface GameLobby {
	id: number;
	pin: string;
	quizId: number;
	hostId: number;
	status: LobbyStatus;
	createdAt: Date;
}

export type LobbyStatus = "WAITING" | "IN_PROGRESS" | "FINISHED" | "CLOSED";

export type GameState =
	| "WAITING"
	| "QUESTION"
	| "SUBMITTED"
	| "RESULTS"
	| "SCOREBOARD"
	| "FINISHED";

export interface Player {
	nickname: string;
	points: number;
}

interface BaseGameState {
	status: GameState;
	currentQuestionIndex: number;
	totalQuestions: number;
}

export interface HostGameState extends BaseGameState {
	pin: string;
	players: Array<Player>;
	answerStats: Record<number, number>;
}

export interface PlayerGameState extends BaseGameState, Player {
	rank: number;
	isLastAnswerCorrect: boolean | null;
}
