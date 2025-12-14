"use client";
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
	}

	return <p>implementing...</p>;
}
