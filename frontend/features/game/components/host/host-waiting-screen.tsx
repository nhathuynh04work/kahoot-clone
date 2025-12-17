"use client";

import { Player } from "../../types";
import { Users, Play, Copy } from "lucide-react";

interface HostWaitingScreenProps {
	pin: string;
	players: Player[];
	onStart: () => void;
}

export const HostWaitingScreen = ({
	pin,
	players,
	onStart,
}: HostWaitingScreenProps) => {
	const copyPin = () => {
		navigator.clipboard.writeText(pin);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
			<div className="w-full max-w-4xl flex flex-col items-center gap-10">
				{/* Header Section */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-white">
						Game Lobby
					</h1>
					<p className="text-gray-400">
						Waiting for players to join...
					</p>
				</div>

				{/* PIN Card */}
				<div className="relative bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-sm flex flex-col items-center w-full max-w-md">
					<span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
						Game PIN
					</span>
					<div
						onClick={copyPin}
						className="group flex items-center gap-4 cursor-pointer"
						title="Click to copy">
						<span className="text-6xl font-mono font-bold text-white tracking-widest">
							{pin}
						</span>
						<Copy
							className="text-gray-500 group-hover:text-indigo-400 transition-colors"
							size={24}
						/>
					</div>
				</div>

				{/* Player List & Action */}
				<div className="w-full flex flex-col items-center gap-6">
					<div className="flex items-center gap-2 text-indigo-400 font-medium">
						<Users size={20} />
						<span>{players.length} joined</span>
					</div>

					<div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 min-h-[200px] flex flex-wrap justify-center content-start gap-3">
						{players.length === 0 ? (
							<div className="flex flex-col items-center justify-center w-full h-32 text-gray-500 gap-2">
								<div className="animate-pulse">
									Waiting for players...
								</div>
							</div>
						) : (
							players.map((player) => (
								<div
									key={player.nickname}
									className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium border border-gray-600 shadow-sm animate-in fade-in zoom-in duration-300">
									{player.nickname}
								</div>
							))
						)}
					</div>

					<button
						onClick={onStart}
						disabled={players.length === 0}
						className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-md ${
							players.length === 0
								? "bg-gray-700 text-gray-400 cursor-not-allowed"
								: "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:scale-105"
						}`}>
						<Play size={24} fill="currentColor" />
						Start Game
					</button>
				</div>
			</div>
		</div>
	);
};
