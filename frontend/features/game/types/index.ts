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

export type QuestionResultMeta = {
	questionType: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "NUMERIC_RANGE";
	correctOptionId?: number;
	correctText?: string;
	rangeMin?: number | null;
	rangeMax?: number | null;
	rangeInclusive?: boolean;
};

export interface HostGameState extends BaseGameState {
	players: Player[];
	currentQuestionAnswerCount: number;
	answerStats: Record<string, string>;
	leaderboard: Player[];
	questionResultMeta: QuestionResultMeta | null;
}

export interface PlayerGameState extends BaseGameState, Player {
	rank: number;
	selectedOptionId: null | number;
	submittedTextAnswer: string | null;
	submittedNumericAnswer: number | null;
	lastRoundCorrect: boolean;
	lastRoundPointsEarned: number;
}

export interface NewQuestionEventPayload {
	currentQuestionIndex: number;
	currentQuestion: QuestionWithOptions;
	totalQuestions: number;
}

export interface ShowResultEventPayload {
	questionType: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "NUMERIC_RANGE";
	optionId?: number;
	correctOptionId?: number;
	correctText?: string;
	rangeMin?: number | null;
	rangeMax?: number | null;
	rangeInclusive?: boolean;
	answerStats: Record<string, string>;
}
