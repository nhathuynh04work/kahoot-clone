"use client";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";
import { useParams, useRouter } from "next/navigation";

export default function HostGameScreen() {
	const router = useRouter();
	const { lobbyId } = useParams();
	const { state, handlers } = useHostGame(Number(lobbyId));

	if (!lobbyId) {
		router.push("/dashboard");
	}

	switch (state.status) {
		case "WAITING":
			return (
				<HostWaitingScreen
					players={state.players}
					pin={state.pin}
					onStart={handlers.handleStartGame}
				/>
			);

		case "QUESTION":
			return (
				<HostQuestionScreen
					currentQuestion={state.currentQuestion!}
					currentQuestionIndex={state.currentQuestionIndex}
					totalQuestions={state.totalQuestions}
					onNext={() => {}}
				/>
			);
	}

	return <p>implementing...</p>;
}
