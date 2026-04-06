import { useReducer } from "react";
import {
	HostGameState,
	NewQuestionEventPayload,
	Player,
	ShowResultEventPayload,
	QuestionResultMeta,
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
	questionResultMeta: null,
};

type HostAction =
	| { type: "SET_PIN"; payload: string }
	| { type: "PLAYER_JOINED"; payload: Player }
	| { type: "PLAYER_LEFT"; payload: string }
	| { type: "PLAYER_REJOINED"; payload: Player }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| { type: "ADD_NEW_ANSWER" }
	| {
			type: "SET_CORRECT_ANSWER";
			payload: ShowResultEventPayload;
	  }
	| { type: "SHOW_LEADERBOARD"; payload: Player[] };

function metaFromPayload(p: ShowResultEventPayload): QuestionResultMeta {
	return {
		questionType: p.questionType ?? "MULTIPLE_CHOICE",
		correctOptionIndices: p.correctOptionIndices,
		correctOptionIndex: p.correctOptionIndex,
		correctText: p.correctText,
		caseSensitive: p.caseSensitive,
		allowRange: p.allowRange,
		correctNumber: p.correctNumber,
		rangeProximity: p.rangeProximity,
	};
}

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

		case "PLAYER_REJOINED": {
			const filtered = state.players.filter(
				(p) => p.nickname !== action.payload.nickname
			);

			return {
				...state,
				players: [...filtered, action.payload],
			};
		}

		case "SET_QUESTION":
			return {
				...state,
				status: "QUESTION",
				currentQuestionAnswerCount: 0,
				currentQuestion: action.payload.currentQuestion,
				currentQuestionIndex: action.payload.currentQuestionIndex,
				totalQuestions: action.payload.totalQuestions,
				currentQuestionCorrectOptionId: null,
				questionResultMeta: null,
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
				currentQuestionCorrectOptionId:
					action.payload.correctOptionIndices?.length === 1
						? action.payload.correctOptionIndices[0]
						: (action.payload.correctOptionIndex ?? null),
				answerStats: action.payload.answerStats,
				questionResultMeta: metaFromPayload(action.payload),
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

	useSocketEvent(
		"newAnswer",
		(_payload: {
			mcSelectedIndex?: number | null;
			textAnswer?: string | null;
			numericAnswer?: number | null;
		}) => {
			dispatch({ type: "ADD_NEW_ANSWER" });
		}
	);

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
			if (!response.success) {
				window.location.href = "/";
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
