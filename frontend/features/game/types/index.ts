import { QuestionWithOptions } from "@/features/quizzes/types";

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
	| "RESULT"
	| "SCOREBOARD"
	| "FINISHED";

export interface Player {
	nickname: string;
	points: number;
}

interface BaseGameState {
	pin: string;
	status: GameState;
	currentQuestionIndex: number;
	currentQuestionCorrectOptionId: null | number;
	currentQuestion: null | QuestionWithOptions;
	totalQuestions: number;
}

export interface HostGameState extends BaseGameState {
	players: Player[];
	answerStats: Record<number, number>;
	leaderboard: Player[];
}

export interface PlayerGameState extends BaseGameState, Player {
	rank: number;
	selectedOptionId: null | number;
}

export interface NewQuestionEventPayload {
	currentQuestionIndex: number;
	currentQuestion: QuestionWithOptions;
	totalQuestions: number;
}
