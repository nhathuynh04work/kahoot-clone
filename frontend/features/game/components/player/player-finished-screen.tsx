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
	let colorClass = "text-(--app-fg-muted)";
	let bgClass = "bg-(--app-surface-muted)";

	if (actualRank === 1) {
		Icon = Trophy;
		colorClass = "text-yellow-400";
		bgClass = "bg-yellow-500/20";
	} else if (actualRank === 2) {
		Icon = Medal;
		colorClass = "text-(--app-fg-muted)";
		bgClass = "bg-(--app-surface-muted)/80";
	} else if (actualRank === 3) {
		Icon = Award;
		colorClass = "text-orange-400";
		bgClass = "bg-orange-500/20";
	}

	return (
		<div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md bg-(--app-elevated) border border-(--app-border) rounded-xl overflow-hidden shadow-2xl">
				{/* Header Section */}
				<div className="bg-(--app-surface-muted) p-8 flex flex-col items-center border-b border-(--app-border)">
					<div
						className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${bgClass}`}>
						<Icon
							size={48}
							className={colorClass}
							fill={actualRank === 1 ? "currentColor" : "none"}
						/>
					</div>
					<h1 className="text-2xl font-bold text-(--app-fg)">Game Over</h1>
					<p className="text-(--app-fg-muted)">Thanks for playing!</p>
				</div>

				{/* Stats Section */}
				<div className="p-6 space-y-4">
					<div className="flex items-center justify-between p-4 bg-(--app-surface-muted) rounded-lg border border-(--app-border)">
						<span className="text-(--app-fg-muted) font-medium">Rank</span>
						<span className={`text-2xl font-bold ${colorClass}`}>
							#{actualRank}
						</span>
					</div>

					<div className="flex items-center justify-between p-4 bg-(--app-surface-muted) rounded-lg border border-(--app-border)">
						<span className="text-(--app-fg-muted) font-medium">
							Final Score
						</span>
						<span className="text-2xl font-mono font-bold text-(--app-fg)">
							{points}
						</span>
					</div>

					<div className="flex items-center justify-center mt-6 pt-4">
						<div className="px-4 py-1 bg-(--app-surface-muted) rounded-full text-sm text-(--app-fg) font-medium border border-(--app-border)">
							{nickname}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
