"use client";

import { HostFinishedScreen } from "@/features/game/components/host/host-finished-screen";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostResultScreen } from "@/features/game/components/host/host-result-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";
import {
	getStatsOfCurrentQuestion,
	getTotalAnswerCountForCurrentQuestion,
} from "@/features/game/lib/helpers";
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
					totalAnswerCount={
						state.currentQuestion
							? getTotalAnswerCountForCurrentQuestion(
									state.currentQuestion,
									state.answerStats
							  )
							: 0
					}
					onTimeUp={handlers.handleTimeUp}
				/>
			);

		case "RESULT":
			return (
				<HostResultScreen
					stats={getStatsOfCurrentQuestion(
						state.currentQuestion!,
						state.answerStats
					)}
					correctOptionId={state.currentQuestionCorrectOptionId!}
					onNext={handlers.handleNextQuestion}
				/>
			);

		case "FINISHED":
			return <HostFinishedScreen leaderboard={state.leaderboard} />;
	}

	return <p>implementing...</p>;
}
