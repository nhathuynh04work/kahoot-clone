"use client";

import { useReducer } from "react";
import { socket } from "@/features/game/lib/socket";

export interface PlayerGameState {
	gameState: "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";
	currentQuestion: any | null;
	error: string | null;
	isConnected: boolean;
	selectedOptionId: number | null;
	correctOptionId: number | null;
	isCorrect: boolean | null;
	questionIndex: number;
	totalQuestions: number;
	timeLimit: number;
	endsAt: number;
}

export const initialState: PlayerGameState = {
	gameState: "WAITING",
	currentQuestion: null,
	error: null,
	isConnected: socket.connected,
	selectedOptionId: null,
	correctOptionId: null,
	isCorrect: null,
	questionIndex: 0,
	totalQuestions: 0,
	timeLimit: 0,
	endsAt: 0,
};

export type PlayerAction =
	| { type: "SET_CONNECTED"; payload: boolean }
	| { type: "SET_ERROR"; payload: string }
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
	| { type: "SUBMIT_ANSWER"; payload: number }
	| { type: "QUESTION_TIME_UP"; payload: { correctOptionId: number } }
	| { type: "GAME_FINISHED" };

function playerReducer(
	state: PlayerGameState,
	action: PlayerAction
): PlayerGameState {
	switch (action.type) {
		case "SET_CONNECTED":
			return { ...state, isConnected: action.payload };

		case "SET_ERROR":
			return { ...state, error: action.payload };

		case "NEW_QUESTION":
			return {
				...state,
				gameState: "QUESTION",
				currentQuestion: action.payload.question,
				questionIndex: action.payload.questionIndex,
				totalQuestions: action.payload.totalQuestions,
				timeLimit: action.payload.timeLimit,
				endsAt: action.payload.endsAt,
				selectedOptionId: null,
				correctOptionId: null,
				isCorrect: null,
			};

		case "SUBMIT_ANSWER":
			return {
				...state,
				selectedOptionId: action.payload,
			};

		case "QUESTION_TIME_UP":
			const isCorrect =
				state.selectedOptionId === action.payload.correctOptionId;
			return {
				...state,
				gameState: "RESULTS",
				correctOptionId: action.payload.correctOptionId,
				isCorrect,
			};

		case "GAME_FINISHED":
			return { ...state, gameState: "FINISHED" };

		default:
			return state;
	}
}

export function usePlayerReducer() {
	return useReducer(playerReducer, initialState);
}
