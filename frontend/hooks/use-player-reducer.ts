"use client";

import { useReducer } from "react";
import { socket } from "@/lib/socket";

export interface PlayerGameState {
	gameState: "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";
	currentQuestion: any | null;
	error: string | null;
	isConnected: boolean;
}

export const initialState: PlayerGameState = {
	gameState: "WAITING",
	currentQuestion: null,
	error: null,
	isConnected: socket.connected,
};

export type PlayerAction =
	| { type: "SET_CONNECTED"; payload: boolean }
	| { type: "SET_ERROR"; payload: string }
	| { type: "NEW_QUESTION"; payload: any }
	| { type: "SHOW_RESULTS" }
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
				currentQuestion: action.payload,
			};

		case "SHOW_RESULTS":
			return { ...state, gameState: "RESULTS" };

		case "GAME_FINISHED":
			return { ...state, gameState: "FINISHED" };

		default:
			return state;
	}
}

export function usePlayerReducer() {
	return useReducer(playerReducer, initialState);
}
