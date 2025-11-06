"use client";

import { use, useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { socket } from "@/lib/socket";

interface GameLobbyPageProps {
	params: Promise<{ id: string }>;
}

export default function GameLobby({ params }: GameLobbyPageProps) {
	const quizId = parseInt(use(params).id);

	const [pin, setPin] = useState<string | null>(null);
	const [players, setPlayers] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		function handlePlayerJoined(player: { id: number; nickname: string }) {
			setPlayers((prev) => [
				...prev.filter((p) => p.id !== player.id),
				player,
			]);
		}

		function handlePlayerLeft(player: { id: number; nickname: string }) {
			setPlayers((prev) => prev.filter((p) => p.id !== player.id));
		}

		socket.on("playerJoined", handlePlayerJoined);
		socket.on("playerLeft", handlePlayerLeft);

		// LOBBY CREATION (only run if pin has not been created)
		if (pin) return;

		socket.emit("createLobby", { quizId }, (response: any) => {
			setLoading(false);

			if (!response.success) {
				setError(response.error || "Failed to create lobby.");
				return;
			}

			setPin(response.pin);
			setError(null);
			setPlayers([{ nickname: "Host", isHost: true, id: socket.id }]);
		});

		return () => {
			socket.off("playerJoined", handlePlayerJoined);
			socket.off("playerLeft", handlePlayerLeft);
		};
	}, [pin, quizId]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-white">
				<Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
				<p className="mt-4">Creating Lobby...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center p-10 text-red-400 bg-gray-800 rounded-lg max-w-xl mx-auto mt-10">
				<h2 className="text-xl font-semibold">Error</h2>
				<p>{error}</p>
			</div>
		);
	}

	if (pin) {
		return (
			<div className="p-8 max-w-4xl mx-auto text-white">
				{/* Game PIN Display */}
				<div className="text-center mb-8 bg-indigo-800 p-6 rounded-xl shadow-2xl">
					<p className="text-xl mb-2">
						Players join at your site URL with PIN:
					</p>
					<h2 className="text-7xl font-mono tracking-widest text-yellow-300">
						{pin}
					</h2>
				</div>

				{/* Players List and Control Panel */}
				<div className="bg-gray-800 p-6 rounded-lg shadow-xl">
					<div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
						<h3 className="text-2xl font-semibold">
							Players ({players.length})
						</h3>
						<button
							className="flex items-center space-x-2 px-6 py-2 bg-green-600 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
							disabled={players.length < 1}>
							<Play className="w-5 h-5" />
							<span>Start Game</span>
						</button>
					</div>

					<ul className="space-y-3 max-h-96 overflow-y-auto">
						{players.map((player) => (
							<li
								key={player.id}
								className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
								<span className="font-medium text-lg">
									{player.nickname}
								</span>
								<span
									className={`text-sm ${
										player.isHost
											? "text-indigo-400"
											: "text-gray-400"
									}`}>
									{player.isHost ? "Host" : "Joined"}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	}

	return null;
}
