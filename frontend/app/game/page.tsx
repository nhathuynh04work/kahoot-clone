"use client";

import { PlayerFinishedScreen } from "@/features/game/components/player/player-finished-screen";
import { PlayerQuestionScreen } from "@/features/game/components/player/player-question-screen";
import { PlayerResultScreen } from "@/features/game/components/player/player-result-screen";
import { PlayerSubmittedScreen } from "@/features/game/components/player/player-submitted-screen";
import { PlayerWaitingScreen } from "@/features/game/components/player/player-waiting-screen";
import { usePlayerGame } from "@/features/game/hooks/use-player-game";

export default function PlayerGameScreen() {
	const { state, handlers } = usePlayerGame();

	switch (state.status) {
		case "WAITING":
			return <PlayerWaitingScreen nickname={state.nickname} />;

		case "QUESTION":
			return (
				<PlayerQuestionScreen
					question={state.currentQuestion!}
					onSubmit={handlers.handleSelectOption}
				/>
			);

		case "SUBMITTED":
			return <PlayerSubmittedScreen />;

		case "RESULT":
			return (
				<PlayerResultScreen
					isCorrect={
						state.currentQuestionCorrectOptionId ===
						state.selectedOptionId
					}
					points={state.points}
				/>
			);

		case "FINISHED":
			return (
				<PlayerFinishedScreen
					nickname={state.nickname}
					points={state.points}
					rank={state.rank}
				/>
			);
	}

	return <div>implementing...</div>;
}
