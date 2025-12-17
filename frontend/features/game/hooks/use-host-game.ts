import { useReducer } from "react";
import {
	HostGameState,
	NewQuestionEventPayload,
	Player,
	ShowResultEventPayload,
} from "../types";
import { useConfirmLeave } from "./use-confirm-leave";
import { useSocketEvent } from "../context/socket-context";
import { useHostJoin } from "./use-join-lobby";
import { socket } from "../lib/socket";
import { toast } from "sonner";

const initialState: HostGameState = {
	pin: "",
	status: "WAITING",

	players: [],
	answerStats: {},
	currentQuestionAnswerCount: 0,
	leaderboard: [],

	currentQuestionIndex: 0,
	currentQuestionCorrectOptionId: null,
	currentQuestion: null,
	totalQuestions: 0,
};

type HostAction =
	| { type: "SET_PIN"; payload: string }
	| { type: "PLAYER_JOINED"; payload: Player }
	| { type: "PLAYER_LEFT"; payload: string }
	| { type: "PLAYER_REJOINED"; payload: Player }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| { type: "ADD_NEW_ANSWER"; payload: number }
	| {
			type: "SET_CORRECT_ANSWER";
			payload: ShowResultEventPayload;
	  }
	| { type: "SHOW_LEADERBOARD"; payload: Player[] };

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

		case "SET_QUESTION":
			return {
				...state,
				status: "QUESTION",
				currentQuestionAnswerCount: 0,
				currentQuestion: action.payload.currentQuestion,
				currentQuestionIndex: action.payload.currentQuestionIndex,
				totalQuestions: action.payload.totalQuestions,
				currentQuestionCorrectOptionId: null,
			};

		case "ADD_NEW_ANSWER":
			return {
				...state,
				currentQuestionAnswerCount:
					state.currentQuestionAnswerCount + 1,
			};

		case "SET_CORRECT_ANSWER":
			return {
				...state,
				status: "RESULT",
				currentQuestionCorrectOptionId: action.payload.optionId,
				answerStats: action.payload.answerStats,
			};

		case "SHOW_LEADERBOARD":
			return {
				...state,
				status: "FINISHED",
				leaderboard: action.payload,
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
		dispatch({ type: "PLAYER_LEFT", payload: nickname });
	});

	useSocketEvent("playerRejoined", (payload: { player: Player }) => {
		dispatch({ type: "PLAYER_REJOINED", payload: payload.player });
	});

	useSocketEvent("newQuestion", (payload: NewQuestionEventPayload) => {
		dispatch({ type: "SET_QUESTION", payload: payload });
	});

	useSocketEvent("newAnswer", (payload: { optionId: number }) => {
		dispatch({ type: "ADD_NEW_ANSWER", payload: payload.optionId });
	});

	useSocketEvent("showResult", (payload: ShowResultEventPayload) => {
		dispatch({
			type: "SET_CORRECT_ANSWER",
			payload: payload,
		});
	});

	useSocketEvent("gameFinished", (payload: { leaderboard: Player[] }) => {
		dispatch({ type: "SHOW_LEADERBOARD", payload: payload.leaderboard });
	});

	const handleStartGame = () => {
		if (state.players.length < 1) {
			toast.error("Cannot start an empty lobby");
			return;
		}

		socket.emit("startGame", { pin: state.pin }, (response: any) => {
			//[TO-DO]: May need some logic here
			if (!response.success) {
				window.location.href = "/dashboard";
			}
		});
	};

	const handleTimeUp = () => {
		socket.emit("timeUp", {
			pin: state.pin,
			questionId: state.currentQuestion!.id,
		});
	};

	const handleNextQuestion = () => {
		socket.emit("nextQuestion", { pin: state.pin });
	};

	const handlers = {
		handleStartGame,
		handleTimeUp,
		handleNextQuestion,
	};

	return { state, handlers };
};
