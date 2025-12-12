"use client";

import Link from "next/link";

interface FinishScreenProps {
	rank: number | null;
	score: number;
}

export default function FinishScreen({ rank, score }: FinishScreenProps) {
	let title = "Game Over";
	let message = "Thanks for playing!";
	let bgColor = "bg-gray-100";

	if (rank === 1) {
		title = "🥇 WINNER! 🥇";
		message = "You are the champion!";
		bgColor = "bg-yellow-100";
	} else if (rank === 2) {
		title = "🥈 2nd Place";
		message = "So close! Great job.";
		bgColor = "bg-slate-200";
	} else if (rank === 3) {
		title = "🥉 3rd Place";
		message = "You made it to the podium!";
		bgColor = "bg-orange-100";
	} else if (rank && rank <= 10) {
		title = "Top 10!";
		message = "You did great!";
		bgColor = "bg-blue-50";
	}

	return (
		<div
			className={`flex flex-col items-center justify-center h-full p-6 ${bgColor}`}>
			<div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full animate-fade-in-up">
				<h1 className="text-4xl font-black text-gray-800 mb-2">
					{title}
				</h1>
				<p className="text-gray-600 mb-8">{message}</p>

				<div className="space-y-4">
					<div className="bg-gray-50 p-4 rounded-xl">
						<p className="text-sm text-gray-500 uppercase font-bold">
							Final Score
						</p>
						<p className="text-3xl font-bold text-blue-600">
							{score}
						</p>
					</div>

					{rank && (
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase font-bold">
								Rank
							</p>
							<p className="text-3xl font-bold text-gray-800">
								#{rank}
							</p>
						</div>
					)}
				</div>

				<Link
					href="/"
					className="block mt-8 w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
					Back to Home
				</Link>
			</div>
		</div>
	);
}
