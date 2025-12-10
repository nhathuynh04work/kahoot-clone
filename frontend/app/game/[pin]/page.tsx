"use client";

import { useParams, useRouter } from "next/navigation";
import { useSocketEvent } from "@/features/game/hooks/use-socket-event";
import { usePlayerReducer } from "@/features/game/hooks/use-player-reducer";
import { socket } from "@/features/game/lib/socket";
import { QuestionWithOptions } from "@/features/quizzes/types";
import QuestionScreen from "@/features/game/components/player/question-screen";
import ResultScreen from "@/features/game/components/player/result-screen";
import FinishScreen from "@/features/game/components/player/finish-screen";
import WaitingScreen from "@/features/game/components/player/waiting-screen";

export default function GamePage() {
	const params = useParams();
	const pin = params.pin as string;
	const router = useRouter();

	const [state, dispatch] = usePlayerReducer();

	function handleSelectOption(optionId: number) {
		socket.emit("submitAnswer", {
			optionId,
			questionId: state.currentQuestion.id,
			pin,
		});

		dispatch({ type: "SUBMIT_ANSWER", payload: optionId });
	}

	useSocketEvent("connect", () =>
		dispatch({ type: "SET_CONNECTED", payload: true })
	);

	useSocketEvent("disconnect", () =>
		dispatch({ type: "SET_ERROR", payload: "You were disconnected." })
	);

	useSocketEvent(
		"newQuestion",
		(data: {
			question: QuestionWithOptions;
			questionIndex: number;
			totalQuestions: number;
			timeLimit: number;
			endsAt: number;
		}) => dispatch({ type: "NEW_QUESTION", payload: data })
	);

	useSocketEvent(
		"questionTimeUp",
		(data: { stats: Record<number, number>; correctOptionId: number }) => {
			dispatch({ type: "QUESTION_TIME_UP", payload: data });
		}
	);

	useSocketEvent("lobbyClosed", () => {
		dispatch({
			type: "SET_ERROR",
			payload: "The host has left the game. Redirecting you to home...",
		});

		setTimeout(() => router.push("/"), 3000);
	});

	switch (state.gameState) {
		case "QUESTION":
			return (
				<QuestionScreen
					question={state.currentQuestion}
					questionIndex={state.questionIndex}
					totalQuestions={state.totalQuestions}
					timeLimit={state.timeLimit}
					endsAt={state.endsAt}
					onSubmitAnswer={handleSelectOption}
					selectedOptionId={state.selectedOptionId}
				/>
			);

		case "RESULTS":
			return <ResultScreen isCorrect={state.isCorrect} />;

		case "FINISHED":
			return <FinishScreen />;

		case "WAITING":
		default:
			return <WaitingScreen pin={pin} />;
	}
}
