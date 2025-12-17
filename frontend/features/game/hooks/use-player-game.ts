import { useReducer } from "react";
import { NewQuestionEventPayload, Player, PlayerGameState } from "../types";
import { useConfirmLeave } from "./use-confirm-leave";
import { usePlayerJoin } from "./use-join-lobby";
import { useSocketEvent } from "../context/socket-context";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

const initialState: PlayerGameState = {
	pin: "",
	nickname: "",
	points: 0,
	rank: 0,
	selectedOptionId: null,

	status: "WAITING",
	currentQuestion: null,
	currentQuestionCorrectOptionId: null,
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

type PlayerAction =
	| { type: "SET_INFO"; payload: { nickname: string; pin: string } }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| { type: "SUBMIT_ANSWER"; payload: number }
	| { type: "SET_CORRECT_ANSWER"; payload: number }
	| { type: "SHOW_LEADERBOARD"; payload: Player[] };

const playerReducer = (
	state: PlayerGameState,
	action: PlayerAction
): PlayerGameState => {
	switch (action.type) {
		case "SET_INFO":
			return {
				...state,
				nickname: action.payload.nickname,
				pin: action.payload.pin,
			};

		case "SET_QUESTION":
			return {
				...state,
				status: "QUESTION",
				currentQuestion: action.payload.currentQuestion,
				currentQuestionIndex: action.payload.currentQuestionIndex,
				totalQuestions: action.payload.totalQuestions,
				currentQuestionCorrectOptionId: null,
				selectedOptionId: null,
			};

		case "SUBMIT_ANSWER":
			return {
				...state,
				status: "SUBMITTED",
				selectedOptionId: action.payload,
			};

		case "SET_CORRECT_ANSWER":
			return {
				...state,
				status: "RESULT",
				currentQuestionCorrectOptionId: action.payload,
				points:
					action.payload === state.selectedOptionId
						? state.points + state.currentQuestion!.points
						: state.points,
			};

		case "SHOW_LEADERBOARD":
			return {
				...state,
				status: "FINISHED",
				rank: action.payload.findIndex(
					(p) => p.nickname === state.nickname
				),
			};
	}
};

export const usePlayerGame = () => {
	const [state, dispatch] = useReducer(playerReducer, initialState);
	const router = useRouter();

	const { disableGuard } = useConfirmLeave();

	usePlayerJoin((nickname: string, pin: string) => {
		dispatch({ type: "SET_INFO", payload: { nickname, pin } });
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

	// Show result at the end of every round
	useSocketEvent("showResult", (payload: { optionId: number }) => {
		dispatch({ type: "SET_CORRECT_ANSWER", payload: payload.optionId });
	});

	useSocketEvent("gameFinished", (payload: { leaderboard: Player[] }) => {
		dispatch({ type: "SHOW_LEADERBOARD", payload: payload.leaderboard });
	});

	const handleSelectOption = (optionId: number) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: optionId });
		socket.emit("submitAnswer", {
			optionId,
			questionId: state.currentQuestion?.id,
			nickname: state.nickname,
			pin: state.pin,
		});
	};

	const handlers = {
		handleSelectOption,
	};

	return { state, handlers };
};
