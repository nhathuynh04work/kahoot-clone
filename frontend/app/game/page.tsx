"use client";

import { PlayerQuestionScreen } from "@/features/game/components/player/player-question-screen";
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
	}
}
