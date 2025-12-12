"use client";

import { use, useEffect } from "react";
import { socket } from "@/features/game/lib/socket";
import { useSocketEvent } from "@/features/game/hooks/use-socket-event";
import Loading from "@/components/common/loading";
import Error from "@/components/common/error";
import {
	LeaderboardItem,
	useHostReducer,
} from "@/features/game/hooks/use-host-reducer";
import { Player } from "@/features/game/types";
import { QuestionWithOptions } from "@/features/quizzes/types";
import QuestionScreen from "@/features/game/components/host/question-screen";
import WaitingScreen from "@/features/game/components/host/waiting-screen";
import HostResultScreen from "@/features/game/components/host/result-screen";
import HostFinishScreen from "@/features/game/components/host/finish-screen";
import { toast } from "sonner";

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

	function handleShowResults() {
		socket.emit("showResults", { gamePin: state.pin });
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

	useSocketEvent(
		"newQuestion",
		(data: {
			question: QuestionWithOptions;
			questionIndex: number;
			totalQuestions: number;
			timeLimit: number;
			endsAt: number;
		}) => dispatch({ type: "NEW_QUESTION", payload: data })
	);

	useSocketEvent("updateAnswerCount", (data: { count: number }) => {
		dispatch({ type: "UPDATE_ANSWER_COUNT", payload: data.count });
	});

	useSocketEvent(
		"questionTimeUp",
		(data: { stats: Record<number, number>; correctOptionId: number }) => {
			dispatch({ type: "QUESTION_TIME_UP", payload: data });
		}
	);

	useSocketEvent("gameOver", (data: { leaderboard: LeaderboardItem[] }) => {
		console.log("Hello");
		dispatch({ type: "GAME_OVER", payload: data.leaderboard });
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
			return (
				<QuestionScreen
					key={state.currentQuestion.id}
					answerCount={state.answerCount}
					totalPlayers={state.players.filter((p) => !p.isHost).length}
					question={state.currentQuestion}
					questionIndex={state.questionIndex}
					totalQuestions={state.totalQuestions}
					timeLimit={state.timeLimit}
					endsAt={state.endsAt}
					onNext={handleShowResults}
				/>
			);

		case "WAITING":
		default:
			return (
				<WaitingScreen
					players={state.players}
					onStartGame={handleStartGame}
					pin={state.pin}
				/>
			);

		case "FINISHED":
			return <HostFinishScreen leaderboard={state.leaderboard} />;

		case "RESULTS":
			if (!state.currentQuestion || !state.questionResults)
				return <Loading />;
			return (
				<HostResultScreen
					question={state.currentQuestion}
					stats={state.questionResults.stats}
					correctOptionId={state.questionResults.correctOptionId}
					onNext={() => {
						console.log(
							state.currentQuestion.sortOrder + 1 !== state.totalQuestions
								? state.currentQuestion.sortOrder
								: "Game over"
						);
						socket.emit("nextQuestion", { pin: state.pin });
					}}
				/>
			);
	}
}
