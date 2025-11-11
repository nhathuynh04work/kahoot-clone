import { socket } from "@/lib/socket";
import { Player } from "@/lib/types/game";
import { useReducer } from "react";

export interface HostGameState {
	gameState: "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";
	pin: string | null;
	players: Player[];
	currentQuestion: any | null;
	error: string | null;
	loading: boolean;
	isConnected: boolean;
}

export const initialState: HostGameState = {
	gameState: "WAITING",
	pin: null,
	players: [],
	currentQuestion: null,
	error: null,
	loading: true,
	isConnected: socket.connected,
};

export type HostGameAction =
	| { type: "SET_CONNECTED"; payload: boolean }
	| { type: "LOBBY_CREATED"; payload: { pin: string; host: Player } }
	| { type: "SET_ERROR"; payload: string }
	| { type: "PLAYER_JOINED"; payload: Player }
	| { type: "PLAYER_LEFT"; payload: Player }
	| { type: "NEW_QUESTION"; payload: any }
	| { type: "GAME_STARTED" };

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
				currentQuestion: action.payload,
			};

		default:
			return state;
	}
}

export function useHostReducer() {
	return useReducer(gameReducer, initialState);
}
