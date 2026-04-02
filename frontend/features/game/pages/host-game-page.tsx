"use client";

import { HostFinishedScreen } from "@/features/game/components/host/host-finished-screen";
import { HostQuestionScreen } from "@/features/game/components/host/host-question-screen";
import { HostResultScreen } from "@/features/game/components/host/host-result-screen";
import { HostWaitingScreen } from "@/features/game/components/host/host-waiting-screen";
import { useHostGame } from "@/features/game/hooks/use-host-game";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function HostGamePage() {
	const router = useRouter();
	const { lobbyId } = useParams();
	const lobbyIdNum = useMemo(() => {
		const raw = Array.isArray(lobbyId) ? lobbyId[0] : lobbyId;
		return Number(raw);
	}, [lobbyId]);

	const { state, handlers } = useHostGame(lobbyIdNum);

	useEffect(() => {
		if (!lobbyId) router.push("/library");
	}, [lobbyId, router]);

	if (!Number.isFinite(lobbyIdNum) || lobbyIdNum <= 0) {
		return (
			<div className="min-h-dvh flex items-center justify-center px-6">
				<div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950/40 p-6 text-center">
					<div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
					<p className="text-lg font-semibold">Loading lobby…</p>
					<p className="mt-1 text-sm text-gray-400">
						Preparing your host session.
					</p>
				</div>
			</div>
		);
	}

	switch (state.status) {
		case "WAITING":
			if (!state.pin) {
				return (
					<div className="min-h-dvh flex items-center justify-center px-6">
						<div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950/40 p-6 text-center">
							<div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
							<p className="text-lg font-semibold">Creating your game PIN…</p>
							<p className="mt-1 text-sm text-gray-400">
								This usually takes a moment.
							</p>
						</div>
					</div>
				);
			}

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
					stats={state.answerStats}
					correctOptionId={state.currentQuestionCorrectOptionId!}
					onNext={handlers.handleNextQuestion}
				/>
			);

		case "FINISHED":
			return <HostFinishedScreen leaderboard={state.leaderboard} />;
	}

	return <p>implementing...</p>;
}

