"use client";

import { Check, X, Trophy } from "lucide-react";

interface PlayerResultScreenProps {
	isCorrect: boolean;
	points: number;
	pointsThisRound?: number;
}

export const PlayerResultScreen = ({
	isCorrect,
	points,
	pointsThisRound = 0,
}: PlayerResultScreenProps) => {
	return (
		<div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md bg-(--app-elevated) border border-(--app-border) rounded-xl p-8 shadow-lg flex flex-col items-center text-center relative overflow-hidden">
				{/* Top Status Bar (Color Accent) */}
				<div
					className={`absolute top-0 left-0 w-full h-2 ${
						isCorrect ? "bg-green-500" : "bg-red-500"
					}`}
				/>

				{/* Icon */}
				<div
					className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${
						isCorrect
							? "bg-green-500/10 text-green-500"
							: "bg-red-500/10 text-red-500"
					}`}>
					{isCorrect ? (
						<Check size={40} strokeWidth={3} />
					) : (
						<X size={40} strokeWidth={3} />
					)}
				</div>

				{/* Title */}
				<h2 className="text-3xl font-bold text-(--app-fg) mb-2">
					{isCorrect ? "Correct!" : "Incorrect"}
				</h2>

				{/* Message */}
				<p className="text-(--app-fg-muted) mb-2">
					{isCorrect
						? "Great job! Keep it up."
						: "Don't worry, you'll get the next one."}
				</p>
				{pointsThisRound > 0 ? (
					<p className="text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-8">
						+{pointsThisRound} points this question
					</p>
				) : (
					<div className="mb-8" />
				)}

				{/* Score Card */}
				<div className="w-full bg-(--app-surface-muted) border border-(--app-border) rounded-lg p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-(--app-surface) rounded-md border border-(--app-border)">
							<Trophy size={20} className="text-yellow-500" />
						</div>
						<span className="text-(--app-fg-muted) font-medium">
							Total Score
						</span>
					</div>
					<span className="text-2xl font-mono font-bold text-(--app-fg)">
						{points}
					</span>
				</div>
			</div>
		</div>
	);
};
