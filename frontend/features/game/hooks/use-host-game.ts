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

type HostAction = { type: "PLAYER_JOINED"; payload: Player };

const hostReducer = (
	state: HostGameState,
	action: HostAction
): HostGameState => {
	switch (action.type) {
		case "PLAYER_JOINED":
			return {
				...state,
				players: [...state.players, action.payload],
			};
	}
};

export const useHostGame = (lobbyId: number) => {
	const [state, dispatch] = useReducer(hostReducer, initialState);

	useConfirmLeave();

	useHostJoin(lobbyId);

	useSocketEvent("playerJoined", ({ player }: { player: Player }) => {
		dispatch({ type: "PLAYER_JOINED", payload: player });
	});

	const handleStartGame = () => {
		socket.emit("startGame");
	};

	return { state, handlers: { handleStartGame } };
};
