"use client";

import { HostFinishedScreen } from "@/features/game/components/host/host-finished-screen";
import { HostCoverBackground } from "@/features/game/components/host/host-cover-background";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostResultScreen } from "@/features/game/components/host/host-result-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";
import { useQuizDetailsQuery } from "@/features/quizzes/hooks/use-quiz-details-query";

export default function HostGamePage({ quizId }: { quizId: number }) {
	const { state, handlers } = useHostGame(quizId);
	const { data: quiz } = useQuizDetailsQuery(quizId, Number.isFinite(quizId) && quizId > 0);
	const coverUrl = quiz?.coverUrl;

	switch (state.status) {
		case "WAITING":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<HostWaitingScreen
						players={state.players}
						pin={state.pin}
						onStart={handlers.handleStartGame}
					/>
				</HostCoverBackground>
			);

		case "QUESTION":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<HostQuestionScreen
						currentQuestion={state.currentQuestion!}
						currentQuestionIndex={state.currentQuestionIndex}
						totalQuestions={state.totalQuestions}
						totalAnswerCount={state.currentQuestionAnswerCount}
						onTimeUp={handlers.handleTimeUp}
					/>
				</HostCoverBackground>
			);

		case "RESULT":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<HostResultScreen
						question={state.currentQuestion!}
						meta={state.questionResultMeta}
						stats={state.answerStats}
						onNext={handlers.handleNextQuestion}
					/>
				</HostCoverBackground>
			);

		case "FINISHED":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<HostFinishedScreen leaderboard={state.leaderboard} />
				</HostCoverBackground>
			);
	}

	return <p>implementing...</p>;
}

