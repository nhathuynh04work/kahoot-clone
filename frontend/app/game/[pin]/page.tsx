"use client";

import { useParams, useRouter } from "next/navigation";
import { useSocketEvent } from "@/hooks/use-socket-event";
import WaitingScreen from "@/components/game/player/waiting-screen";
import QuestionScreen from "@/components/game/player/question-screen";
import FinishScreen from "@/components/game/player/finish-screen";
import ResultScreen from "@/components/game/player/result-screen";
import { usePlayerReducer } from "@/hooks/use-player-reducer";
import { QuestionWithOptions } from "@/lib/types/quiz";
import { socket } from "@/lib/socket";

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
	}

	useSocketEvent("connect", () =>
		dispatch({ type: "SET_CONNECTED", payload: true })
	);

	useSocketEvent("disconnect", () =>
		dispatch({ type: "SET_ERROR", payload: "You were disconnected." })
	);

	useSocketEvent("newQuestion", (question: QuestionWithOptions) =>
		dispatch({ type: "NEW_QUESTION", payload: question })
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
					key={state.currentQuestion.id}
					onSelect={handleSelectOption}
					question={state.currentQuestion}
				/>
			);

		case "RESULTS":
			return <ResultScreen />;

		case "FINISHED":
			return <FinishScreen />;

		case "WAITING":
		default:
			return <WaitingScreen pin={pin} />;
	}
}
