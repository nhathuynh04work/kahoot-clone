"use client";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";
import { QuestionWithOptions } from "@/features/quizzes/types";
import { useParams, useRouter } from "next/navigation";

const getTotalAnswerCountForCurrentQuestion = (
	question: QuestionWithOptions,
	answerStats: Record<number, number>
) => {
	const questionOptionIds = question.options.map((o) => o.id);

	const totalCount = questionOptionIds.reduce((sum, id) => {
		if (id in answerStats) {
			return sum + answerStats[id];
		}

		return sum;
	}, 0);

	return totalCount;
};

export default function HostGameScreen() {
	const router = useRouter();
	const { lobbyId } = useParams();
	const { state, handlers } = useHostGame(Number(lobbyId));

	if (!lobbyId) {
		router.push("/dashboard");
	}

	const totalAnswerCount = state.currentQuestion
		? getTotalAnswerCountForCurrentQuestion(
				state.currentQuestion,
				state.answerStats
		  )
		: 0;

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
					totalAnswerCount={totalAnswerCount}
					onNext={() => {}}
				/>
			);
	}

	return <p>implementing...</p>;
}
