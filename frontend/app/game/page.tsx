"use client";

import { PlayerWaitingScreen } from "@/features/game/components/player/player-waiting-screen";
import { usePlayerGame } from "@/features/game/hooks/use-player-game";

export default function PlayerGameScreen() {
	const { state } = usePlayerGame();

	switch (state.status) {
		case "WAITING":
			return <PlayerWaitingScreen nickname={state.nickname} />;
	}
}
