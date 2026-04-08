"use client";

import { HostFinishedScreen } from "@/features/game/components/host/host-finished-screen";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostResultScreen } from "@/features/game/components/host/host-result-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";

export default function HostGamePage({ quizId }: { quizId: number }) {
	const { state, handlers } = useHostGame(quizId);

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
					totalAnswerCount={state.currentQuestionAnswerCount}
					onTimeUp={handlers.handleTimeUp}
				/>
			);

		case "RESULT":
			return (
				<HostResultScreen
					question={state.currentQuestion!}
					meta={state.questionResultMeta}
					stats={state.answerStats}
					onNext={handlers.handleNextQuestion}
				/>
			);

		case "FINISHED":
			return <HostFinishedScreen leaderboard={state.leaderboard} />;
	}

	return <p>implementing...</p>;
}

