import { socket } from "@/features/game/lib/socket";
import { useReducer } from "react";
import { Player } from "../types";

export interface LeaderboardItem {
	id: number;
	nickname: string;
	score: number;
}

export interface HostGameState {
	gameState: "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";
	pin: string | null;
	players: Player[];
	currentQuestion: any | null;
	questionIndex: number;
	totalQuestions: number;
	timeLimit: number;
	endsAt: number;
	error: string | null;
	loading: boolean;
	isConnected: boolean;
	answerCount: number;
	questionResults: {
		stats: Record<number, number>;
		correctOptionId: number;
	} | null;
	leaderboard: LeaderboardItem[];
}

export const initialState: HostGameState = {
	gameState: "WAITING",
	pin: null,
	players: [],
	currentQuestion: null,
	questionIndex: 0,
	totalQuestions: 0,
	timeLimit: 0,
	endsAt: 0,
	error: null,
	loading: true,
	isConnected: socket.connected,
	answerCount: 0,
	questionResults: null,
	leaderboard: [],
};

export type HostGameAction =
	| { type: "SET_CONNECTED"; payload: boolean }
	| { type: "LOBBY_CREATED"; payload: { pin: string; host: Player } }
	| { type: "SET_ERROR"; payload: string }
	| { type: "PLAYER_JOINED"; payload: Player }
	| { type: "PLAYER_LEFT"; payload: Player }
	| {
			type: "NEW_QUESTION";
			payload: {
				question: any;
				questionIndex: number;
				totalQuestions: number;
				timeLimit: number;
				endsAt: number;
			};
	  }
	| { type: "GAME_STARTED" }
	| { type: "UPDATE_ANSWER_COUNT"; payload: number }
	| {
			type: "QUESTION_TIME_UP";
			payload: {
				stats: Record<number, number>;
				correctOptionId: number;
			};
	  }
	| { type: "GAME_OVER"; payload: LeaderboardItem[] };

function gameReducer(
	state: HostGameState,
	action: HostGameAction
): HostGameState {
	switch (action.type) {
		case "SET_CONNECTED":
			return { ...state, isConnected: action.payload };

		case "LOBBY_CREATED":
			return {
				...state,
				loading: false,
				pin: action.payload.pin,
				players: [action.payload.host],
			};

		case "SET_ERROR":
			return { ...state, loading: false, error: action.payload };

		case "PLAYER_JOINED":
			return {
				...state,
				players: [
					...state.players.filter((p) => p.id !== action.payload.id),
					action.payload,
				],
			};

		case "PLAYER_LEFT":
			return {
				...state,
				players: state.players.filter(
					(p) => p.id !== action.payload.id
				),
			};

		case "GAME_STARTED":
			return { ...state, gameState: "QUESTION" };

		case "NEW_QUESTION":
			return {
				...state,
				gameState: "QUESTION",
				currentQuestion: action.payload.question,
				questionIndex: action.payload.questionIndex,
				totalQuestions: action.payload.totalQuestions,
				timeLimit: action.payload.timeLimit,
				endsAt: action.payload.endsAt,
				answerCount: 0,
				questionResults: null,
			};

		case "UPDATE_ANSWER_COUNT":
			return {
				...state,
				answerCount: action.payload,
			};

		case "QUESTION_TIME_UP":
			return {
				...state,
				gameState: "RESULTS",
				questionResults: action.payload,
			};

		case "GAME_OVER":
			return {
				...state,
				gameState: "FINISHED",
				leaderboard: action.payload,
				loading: false,
			};

		default:
			return state;
	}
}

export function useHostReducer() {
	return useReducer(gameReducer, initialState);
}
