import { useReducer } from "react";
import {
	NewQuestionEventPayload,
	Player,
	PlayerGameState,
	ShowResultEventPayload,
} from "../types";
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
	submittedTextAnswer: null,
	submittedNumericAnswer: null,
	lastRoundCorrect: false,
	lastRoundPointsEarned: 0,

	status: "WAITING",
	currentQuestion: null,
	currentQuestionCorrectOptionId: null,
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

function playerWasCorrect(
	state: PlayerGameState,
	payload: ShowResultEventPayload
): boolean {
	const qType = payload.questionType ?? "MULTIPLE_CHOICE";
	if (qType === "MULTIPLE_CHOICE") {
		const correctId = payload.correctOptionId ?? payload.optionId;
		return (
			correctId != null &&
			state.selectedOptionId != null &&
			correctId === state.selectedOptionId
		);
	}
	if (qType === "SHORT_ANSWER") {
		const got = (state.submittedTextAnswer ?? "").trim().toLowerCase();
		const expected = (payload.correctText ?? "").trim().toLowerCase();
		return got.length > 0 && got === expected;
	}
	if (qType === "NUMERIC_RANGE") {
		const n = state.submittedNumericAnswer;
		if (n == null || !Number.isFinite(n)) return false;
		if (
			payload.rangeMin == null ||
			payload.rangeMax == null ||
			!Number.isFinite(payload.rangeMin) ||
			!Number.isFinite(payload.rangeMax)
		) {
			return false;
		}
		const inc = payload.rangeInclusive !== false;
		return inc
			? n >= payload.rangeMin && n <= payload.rangeMax
			: n > payload.rangeMin && n < payload.rangeMax;
	}
	return false;
}

type PlayerAction =
	| { type: "SET_INFO"; payload: { nickname: string; pin: string } }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| {
			type: "SUBMIT_ANSWER";
			payload: {
				optionId?: number;
				textAnswer?: string;
				numericAnswer?: number;
			};
	  }
	| { type: "SET_CORRECT_ANSWER"; payload: ShowResultEventPayload }
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
				submittedTextAnswer: null,
				submittedNumericAnswer: null,
			};

		case "SUBMIT_ANSWER":
			return {
				...state,
				status: "SUBMITTED",
				selectedOptionId: action.payload.optionId ?? null,
				submittedTextAnswer: action.payload.textAnswer ?? null,
				submittedNumericAnswer: action.payload.numericAnswer ?? null,
			};

		case "SET_CORRECT_ANSWER": {
			const q = state.currentQuestion;
			const correct = playerWasCorrect(state, action.payload);
			const pts = q && correct ? q.points : 0;
			const correctId =
				action.payload.correctOptionId ?? action.payload.optionId ?? null;
			return {
				...state,
				status: "RESULT",
				currentQuestionCorrectOptionId: correctId,
				points: state.points + pts,
				lastRoundCorrect: correct,
				lastRoundPointsEarned: pts,
			};
		}

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

	useSocketEvent("hostLeft", () => {
		disableGuard();
		localStorage.removeItem("recovery");
		window.location.href = "/";
	});

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

	useSocketEvent("newQuestion", (payload: NewQuestionEventPayload) => {
		dispatch({ type: "SET_QUESTION", payload: payload });
	});

	useSocketEvent("showResult", (payload: ShowResultEventPayload) => {
		dispatch({ type: "SET_CORRECT_ANSWER", payload });
	});

	useSocketEvent("gameFinished", (payload: { leaderboard: Player[] }) => {
		dispatch({ type: "SHOW_LEADERBOARD", payload: payload.leaderboard });
	});

	const handleSelectOption = (optionId: number) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: { optionId } });
		socket.emit("submitAnswer", {
			optionId,
			questionId: state.currentQuestion?.id,
			nickname: state.nickname,
			pin: state.pin,
		});
	};

	const handleSubmitText = (textAnswer: string) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: { textAnswer } });
		socket.emit("submitAnswer", {
			textAnswer,
			questionId: state.currentQuestion?.id,
			nickname: state.nickname,
			pin: state.pin,
		});
	};

	const handleSubmitNumeric = (numericAnswer: number) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: { numericAnswer } });
		socket.emit("submitAnswer", {
			numericAnswer,
			questionId: state.currentQuestion?.id,
			nickname: state.nickname,
			pin: state.pin,
		});
	};

	const handlers = {
		handleSelectOption,
		handleSubmitText,
		handleSubmitNumeric,
	};

	return { state, handlers };
};
