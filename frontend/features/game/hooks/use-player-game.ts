import { useReducer } from "react";
import { PlayerGameState } from "../types";
import { useConfirmLeave } from "./use-confirm-leave";
import { usePlayerJoin } from "./use-join-lobby";
import { useSocketEvent } from "../context/socket-context";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

const initialState: PlayerGameState = {
	nickname: "",
	points: 0,
	rank: 0,
	isLastAnswerCorrect: null,

	status: "WAITING",
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

type PlayerAction =
	| { type: "SET_NICKNAME"; payload: string }
	| { type: "SET_QUESTION" }
	| { type: "ANSWER_SUBMITTED" };

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
				isLastAnswerCorrect: null,
			};

		case "ANSWER_SUBMITTED":
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

	useSocketEvent("hostLeft", () => {
		disableGuard();
		localStorage.removeItem("recovery");
		window.location.href = "/";
	});

	useSocketEvent(
		"playerRejoined",
		(payload: { nickname: string; newSocketId: string }) => {
			const { nickname, newSocketId } = payload;

			if (state.nickname === nickname && socket.id !== newSocketId) {
				disableGuard();
				router.push("/");
			}
		}
	);

	return { state };
};
