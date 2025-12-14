import { useReducer } from "react";
import { PlayerGameState } from "../types";
import { useConfirmUnload } from "./use-confirm-unload";

const initialState: PlayerGameState = {
	nickname: "",
	points: 0,
	rank: 0,
	isLastAnswerCorrect: null,

	status: "WAITING",
	currentQuestionIndex: 0,
	totalQuestions: 0,
};

type PlayerAction = { type: "SET_QUESTION" } | { type: "ANSWER_SUBMITTED" };

const playerReducer = (
	state: PlayerGameState,
	action: PlayerAction
): PlayerGameState => {
	switch (action.type) {
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

	useConfirmUnload();

	return { state };
};
