"use client";

import { use, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { Player } from "@/lib/types/game";
import Loading from "@/components/common/loading";
import Error from "@/components/common/error";
import { useHostReducer } from "@/hooks/use-host-reducer";
import WaitingScreen from "@/components/game/host/waiting-screen";
import { QuestionWithOptions } from "@/lib/types/quiz";
import QuestionScreen from "@/components/game/host/question-screen";

interface HostGameProps {
	params: Promise<{ id: string }>;
}

export default function HostGame({ params }: HostGameProps) {
	const quizId = parseInt(use(params).id);

	const [state, dispatch] = useHostReducer();

	function handleStartGame() {
		if (state.loading || !state.pin) return;

		socket.emit(
			"startGame",
			{ pin: state.pin, quizId },
			(response: any) => {
				if (response.success) return;

				dispatch({ type: "SET_ERROR", payload: response.error });
			}
		);
	}

	useSocketEvent("connect", () =>
		dispatch({ type: "SET_CONNECTED", payload: true })
	);

	useSocketEvent("disconnect", () =>
		dispatch({ type: "SET_CONNECTED", payload: false })
	);

	useSocketEvent("playerJoined", (player: Player) => {
		dispatch({ type: "PLAYER_JOINED", payload: player });
	});

	useSocketEvent("playerLeft", (player: Player) => {
		dispatch({ type: "PLAYER_LEFT", payload: player });
	});

	useSocketEvent("newQuestion", (question: QuestionWithOptions) => {
		dispatch({ type: "NEW_QUESTION", payload: question });
	});

	useEffect(() => {
		if (state.pin || !state.isConnected) return;

		socket.emit("createLobby", { quizId }, (response: any) => {
			if (!response.success) {
				dispatch({ type: "SET_ERROR", payload: response.error });
				return;
			}

			dispatch({
				type: "LOBBY_CREATED",
				payload: {
					pin: response.pin,
					host: { nickname: "Host", isHost: true, id: socket.id! },
				},
			});
		});
	}, [state.pin, dispatch, quizId, state.isConnected]);

	if (state.loading) return <Loading />;
	if (state.error) return <Error error={state.error} />;
	if (!state.pin) return null;

	switch (state.gameState) {
		case "QUESTION":
			return <QuestionScreen question={state.currentQuestion} />;

		case "WAITING":
		default:
			return (
				<WaitingScreen
					players={state.players}
					onStartGame={handleStartGame}
					pin={state.pin}
				/>
			);
	}
}
