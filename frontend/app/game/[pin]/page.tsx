"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

type GameState = "WAITING" | "QUESTION" | "RESULTS" | "FINISHED";

export default function GamePage() {
	const params = useParams();
	const pin = params.pin as string;
	const router = useRouter();

	const [gameState, setGameState] = useState<GameState>("WAITING");
	const [currentQuestion, setCurrentQuestion] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Event from server: The game has started, here is the first question
		socket.on("newQuestion", (question: any) => {
			setCurrentQuestion(question);
			setGameState("QUESTION");
		});

		// Event from server: Show the leaderboard/results
		socket.on("showLeaderboard", (leaderboard: any) => {
			setGameState("RESULTS");
			// You would store the leaderboard data here
		});

		// Event from server: The game is over
		socket.on("gameFinished", (finalScores: any) => {
			setGameState("FINISHED");
		});

		// Handle disconnection or errors
		socket.on("disconnect", () => {
			setError("Lost connection to the game.");
		});

		socket.on("lobbyClosed", () => {
			setError("The host has left the game. Redirecting you to home...");
			setTimeout(() => {
				router.push("/");
			}, 3000);
		});

		// Clean up listeners when the component unmounts
		return () => {
			socket.off("newQuestion");
			socket.off("showLeaderboard");
			socket.off("gameFinished");
			socket.off("disconnect");
			socket.off("lobbyClosed");
		};
	}, [router]);

	if (error) {
		return <div className="text-center p-10 text-red-400">{error}</div>;
	}

	if (gameState === "WAITING") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-white">
				<h1 className="text-4xl font-bold mb-4">You&apos;re in!</h1>
				<p className="text-2xl text-gray-300">Get ready to play...</p>
				<p className="mt-8 text-lg">Game PIN: {pin}</p>
			</div>
		);
	}

	if (gameState === "QUESTION") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
				<h2 className="text-3xl font-bold mb-8 text-center">
					{currentQuestion?.text}
				</h2>
				<div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
					{currentQuestion?.options.map((option: any) => (
						<button
							key={option.id}
							// TODO: Add onClick handler to emit 'submitAnswer'
							className="p-8 bg-indigo-600 rounded-lg text-2xl font-semibold hover:bg-indigo-700 transition">
							{option.text}
						</button>
					))}
				</div>
			</div>
		);
	}

	// TODO: Add render logic for 'RESULTS' and 'FINISHED' states

	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-white">
			<h1 className="text-2xl">Game Screen for {pin}</h1>
		</div>
	);
}
