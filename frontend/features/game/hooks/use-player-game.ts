import { useReducer } from "react";
import { NewQuestionEventPayload, Player, PlayerGameState } from "../types";
import { useConfirmLeave } from "./use-confirm-leave";
import { usePlayerJoin } from "./use-join-lobby";
import { useSocketEvent } from "../context/socket-context";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

const initialState: PlayerGameState = {
	nickname: "",
	points: 0,
	rank: 0,
	selectedOptionId: null,

	status: "WAITING",
	currentQuestion: null,
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

type PlayerAction =
	| { type: "SET_NICKNAME"; payload: string }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| { type: "SUBMIT_ANSWER"; payload: number };

const playerReducer = (
	state: PlayerGameState,
	action: PlayerAction
): PlayerGameState => {
	switch (action.type) {
		case "SET_NICKNAME":
			return {
				...state,
				nickname: action.payload,
			};

		case "SET_QUESTION":
			return {
				...state,
				status: "QUESTION",
				currentQuestion: action.payload.currentQuestion,
				currentQuestionIndex: action.payload.currentQuestionIndex,
				totalQuestions: action.payload.totalQuestions,
				selectedOptionId: null,
			};

		case "SUBMIT_ANSWER":
			return {
				...state,
				status: "SUBMITTED",
			};
	}
};

export const usePlayerGame = () => {
	const [state, dispatch] = useReducer(playerReducer, initialState);
	const router = useRouter();

	const { disableGuard } = useConfirmLeave();

	usePlayerJoin((nickname: string) => {
		dispatch({ type: "SET_NICKNAME", payload: nickname });
	});

	// Host left
	useSocketEvent("hostLeft", () => {
		disableGuard();
		localStorage.removeItem("recovery");
		window.location.href = "/";
	});

	// Player rejoined
	useSocketEvent(
		"playerRejoined",
		(payload: { player: Player; newSocketId: string }) => {
			const { player, newSocketId } = payload;

			if (
				state.nickname === player.nickname &&
				socket.id !== newSocketId
			) {
				disableGuard();
				router.push("/");
			}
		}
	);

	// New question
	useSocketEvent("newQuestion", (payload: NewQuestionEventPayload) => {
		dispatch({ type: "SET_QUESTION", payload: payload });
	});

	const handleSelectOption = (optionId: number) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: optionId });
	};

	const handlers = {
		handleSelectOption,
	};
    
	return { state, handlers };
};
