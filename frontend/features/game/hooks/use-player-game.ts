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

function mcCorrectIndices(payload: ShowResultEventPayload): number[] {
	if (payload.correctOptionIndices?.length) {
		return payload.correctOptionIndices;
	}
	if (payload.correctOptionIndex != null) {
		return [payload.correctOptionIndex];
	}
	return [];
}

function playerWasCorrect(
	state: PlayerGameState,
	payload: ShowResultEventPayload
): boolean {
	const qType = payload.questionType ?? "MULTIPLE_CHOICE";
	if (qType === "MULTIPLE_CHOICE" || qType === "TRUE_FALSE") {
		const indices = mcCorrectIndices(payload);
		return (
			indices.length > 0 &&
			state.selectedOptionId != null &&
			indices.includes(state.selectedOptionId)
		);
	}
	if (qType === "SHORT_ANSWER") {
		const got = (state.submittedTextAnswer ?? "").trim();
		const expected = (payload.correctText ?? "").trim();
		if (!got.length) return false;
		if (payload.caseSensitive === true) {
			return got === expected;
		}
		return got.toLowerCase() === expected.toLowerCase();
	}
	if (qType === "NUMBER_INPUT") {
		const n = state.submittedNumericAnswer;
		if (n == null || !Number.isFinite(n)) return false;
		if (payload.allowRange === true) {
			if (
				payload.correctNumber == null ||
				!Number.isFinite(payload.correctNumber) ||
				payload.rangeProximity == null ||
				!Number.isFinite(payload.rangeProximity)
			) {
				return false;
			}
			const min = payload.correctNumber - payload.rangeProximity;
			const max = payload.correctNumber + payload.rangeProximity;
			return n >= min && n <= max;
		}
		if (payload.correctNumber == null || !Number.isFinite(payload.correctNumber)) {
			return false;
		}
		return n === payload.correctNumber;
	}
	return false;
}

type PlayerAction =
	| { type: "SET_INFO"; payload: { nickname: string; pin: string } }
	| { type: "SET_QUESTION"; payload: NewQuestionEventPayload }
	| {
			type: "SUBMIT_ANSWER";
			payload: {
				mcSelectedIndex?: number;
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
				selectedOptionId: action.payload.mcSelectedIndex ?? null,
				submittedTextAnswer: action.payload.textAnswer ?? null,
				submittedNumericAnswer: action.payload.numericAnswer ?? null,
			};

		case "SET_CORRECT_ANSWER": {
			const q = state.currentQuestion;
			const correct = playerWasCorrect(state, action.payload);
			const pts = q && correct ? q.points : 0;
			const indices = mcCorrectIndices(action.payload);
			const correctId =
				indices.length === 1 ? indices[0] : (action.payload.correctOptionIndex ?? null);
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

	const handleSelectOption = (mcSelectedIndex: number) => {
		dispatch({ type: "SUBMIT_ANSWER", payload: { mcSelectedIndex } });
		socket.emit("submitAnswer", {
			mcSelectedIndex,
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
