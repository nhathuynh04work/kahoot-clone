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

export type Player = {
	nickname: string;
	points: number;
};

interface BaseGameState {
	pin: string;
	status: GameState;
	currentQuestionIndex: number;
	/** For multiple choice: 0-based index of the correct option. */
	currentQuestionCorrectOptionId: null | number;
	currentQuestion: null | QuestionWithOptions;
	totalQuestions: number;
}

export type QuestionResultMeta = {
	questionType:
		| "MULTIPLE_CHOICE"
		| "TRUE_FALSE"
		| "SHORT_ANSWER"
		| "NUMBER_INPUT";
	correctOptionIndices?: number[];
	correctOptionIndex?: number;
	correctText?: string;
	caseSensitive?: boolean;
	allowRange?: boolean;
	correctNumber?: number | null;
	rangeProximity?: number | null;
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
	/** Selected multiple-choice option index (0-based). */
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
	questionType:
		| "MULTIPLE_CHOICE"
		| "TRUE_FALSE"
		| "SHORT_ANSWER"
		| "NUMBER_INPUT";
	correctOptionIndices?: number[];
	correctOptionIndex?: number;
	correctText?: string;
	caseSensitive?: boolean;
	allowRange?: boolean;
	correctNumber?: number | null;
	rangeProximity?: number | null;
	answerStats: Record<string, string>;
}
