"use client";

import { useEffect, useState } from "react";
import { PlayerFinishedScreen } from "@/features/game/components/player/player-finished-screen";
import { PlayerQuestionScreen } from "@/features/game/components/player/player-question-screen";
import { PlayerResultScreen } from "@/features/game/components/player/player-result-screen";
import { PlayerSubmittedScreen } from "@/features/game/components/player/player-submitted-screen";
import { PlayerWaitingScreen } from "@/features/game/components/player/player-waiting-screen";
import { usePlayerGame } from "@/features/game/hooks/use-player-game";
import { HostCoverBackground } from "@/features/game/components/host/host-cover-background";
import { getValidLobby } from "@/features/game/api/server-actions";

export default function PlayerGamePage() {
	const { state, handlers } = usePlayerGame();
	const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const session = localStorage.getItem("recovery");
				if (!session) return;
				const parsed = JSON.parse(session) as { pin?: string };
				const pin = typeof parsed?.pin === "string" ? parsed.pin : "";
				if (!pin) return;
				const lobby = await getValidLobby(pin);
				if (cancelled) return;
				setCoverUrl(lobby?.quiz?.coverUrl);
			} catch {
				// Ignore cover lookup failures; gameplay should still work.
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	switch (state.status) {
		case "WAITING":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<PlayerWaitingScreen nickname={state.nickname} pin={state.pin} />
				</HostCoverBackground>
			);

		case "QUESTION":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<PlayerQuestionScreen
						question={state.currentQuestion!}
						onSelectOption={handlers.handleSelectOption}
						onSubmitText={handlers.handleSubmitText}
						onSubmitNumeric={handlers.handleSubmitNumeric}
					/>
				</HostCoverBackground>
			);

		case "SUBMITTED":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<PlayerSubmittedScreen />
				</HostCoverBackground>
			);

		case "RESULT":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<PlayerResultScreen
						isCorrect={state.lastRoundCorrect}
						points={state.points}
						pointsThisRound={state.lastRoundPointsEarned}
					/>
				</HostCoverBackground>
			);

		case "FINISHED":
			return (
				<HostCoverBackground coverUrl={coverUrl}>
					<PlayerFinishedScreen
						nickname={state.nickname}
						points={state.points}
						rank={state.rank}
					/>
				</HostCoverBackground>
			);
	}

	return <div>implementing...</div>;
}

