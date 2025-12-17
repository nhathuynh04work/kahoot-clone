"use client";

import { Trophy, Medal, Award, Star } from "lucide-react";

interface PlayerFinishedScreenProps {
	nickname: string;
	points: number;
	rank: number;
}

export const PlayerFinishedScreen = ({
	nickname,
	points,
	rank,
}: PlayerFinishedScreenProps) => {
	const actualRank = rank + 1;

	// Determine Icon & Color based on rank
	let Icon = Star;
	let colorClass = "text-gray-400";
	let bgClass = "bg-gray-700";

	if (actualRank === 1) {
		Icon = Trophy;
		colorClass = "text-yellow-400";
		bgClass = "bg-yellow-500/20";
	} else if (actualRank === 2) {
		Icon = Medal;
		colorClass = "text-gray-300";
		bgClass = "bg-gray-400/20";
	} else if (actualRank === 3) {
		Icon = Award;
		colorClass = "text-orange-400";
		bgClass = "bg-orange-500/20";
	}

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
				{/* Header Section */}
				<div className="bg-gray-900 p-8 flex flex-col items-center border-b border-gray-700">
					<div
						className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${bgClass}`}>
						<Icon
							size={48}
							className={colorClass}
							fill={actualRank === 1 ? "currentColor" : "none"}
						/>
					</div>
					<h1 className="text-2xl font-bold text-white">Game Over</h1>
					<p className="text-gray-400">Thanks for playing!</p>
				</div>

				{/* Stats Section */}
				<div className="p-6 space-y-4">
					<div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
						<span className="text-gray-400 font-medium">Rank</span>
						<span className={`text-2xl font-bold ${colorClass}`}>
							#{actualRank}
						</span>
					</div>

					<div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
						<span className="text-gray-400 font-medium">
							Final Score
						</span>
						<span className="text-2xl font-mono font-bold text-white">
							{points}
						</span>
					</div>

					<div className="flex items-center justify-center mt-6 pt-4">
						<div className="px-4 py-1 bg-gray-700 rounded-full text-sm text-gray-300 font-medium">
							{nickname}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
