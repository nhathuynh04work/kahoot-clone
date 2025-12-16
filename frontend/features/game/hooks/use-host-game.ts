import { useReducer } from "react";
import { HostGameState, Player } from "../types";
import { useConfirmLeave } from "./use-confirm-leave";
import { useSocketEvent } from "../context/socket-context";
import { useHostJoin } from "./use-join-lobby";
import { socket } from "../lib/socket";

const initialState: HostGameState = {
	pin: "",
	players: [],
	answerStats: {},

	status: "WAITING",
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

type HostAction =
	| { type: "SET_PIN"; payload: string }
	| { type: "PLAYER_JOINED"; payload: Player }
	| { type: "PLAYER_LEFT"; payload: string }
	| { type: "PLAYER_REJOINED"; payload: Player };

const hostReducer = (
	state: HostGameState,
	action: HostAction
): HostGameState => {
	switch (action.type) {
		case "SET_PIN":
			return {
				...state,
				pin: action.payload,
			};

		case "PLAYER_JOINED":
			return {
				...state,
				players: [...state.players, action.payload],
			};

		case "PLAYER_LEFT":
			return {
				...state,
				players: state.players.filter(
					(p) => p.nickname !== action.payload
				),
			};

		case "PLAYER_REJOINED":
			const filtered = state.players.filter(
				(p) => p.nickname !== action.payload.nickname
			);

			return {
				...state,
				players: [...filtered, action.payload],
			};
	}
};

export const useHostGame = (lobbyId: number) => {
	const [state, dispatch] = useReducer(hostReducer, initialState);

	useConfirmLeave();

	useHostJoin(lobbyId, (pin: string) => {
		dispatch({ type: "SET_PIN", payload: pin });
	});

	useSocketEvent("playerJoined", ({ player }: { player: Player }) => {
		dispatch({ type: "PLAYER_JOINED", payload: player });
	});

	useSocketEvent("playerLeft", ({ nickname }: { nickname: string }) => {
		console.log(nickname);
		dispatch({ type: "PLAYER_LEFT", payload: nickname });
	});

	useSocketEvent("playerRejoined", (payload: { player: Player }) => {
		dispatch({ type: "PLAYER_REJOINED", payload: payload.player });
	});

	const handleStartGame = () => {
		socket.emit("startGame");
	};

	return { state, handlers: { handleStartGame } };
};
