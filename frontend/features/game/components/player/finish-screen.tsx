"use client";

import Link from "next/link";
import { Trophy, Medal, Award, Frown } from "lucide-react";

interface FinishScreenProps {
	rank: number | null;
	score: number;
}

export default function FinishScreen({ rank, score }: FinishScreenProps) {
	let TitleIcon = Frown;
	let title = "Game Over";
	let message = "Thanks for playing!";
	let iconColor = "text-gray-400";
	let bgGradient = "from-gray-900 to-gray-800";

	if (rank === 1) {
		TitleIcon = Trophy;
		title = "Winner!";
		message = "You are the champion!";
		iconColor = "text-yellow-400";
		bgGradient = "from-yellow-900/40 to-gray-900";
	} else if (rank === 2) {
		TitleIcon = Medal;
		title = "2nd Place";
		message = "So close! Great job.";
		iconColor = "text-slate-300";
		bgGradient = "from-slate-800/60 to-gray-900";
	} else if (rank === 3) {
		TitleIcon = Medal;
		title = "3rd Place";
		message = "You made it to the podium!";
		iconColor = "text-orange-400";
		bgGradient = "from-orange-900/40 to-gray-900";
	} else if (rank && rank <= 10) {
		TitleIcon = Award;
		title = "Top 10!";
		message = "You did great!";
		iconColor = "text-blue-400";
		bgGradient = "from-blue-900/40 to-gray-900";
	}

	return (
		<div
			className={`flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-b ${bgGradient} text-white`}>
			<div className="w-full max-w-sm animate-fade-in-up flex flex-col items-center">
				{/* Main Icon */}
				<div
					className={`mb-6 p-6 rounded-full bg-gray-800/80 border border-gray-700 shadow-xl ${iconColor}`}>
					<TitleIcon className="w-16 h-16" strokeWidth={1.5} />
				</div>

				<h1 className="text-4xl font-black mb-2 tracking-tight">
					{title}
				</h1>
				<p className="text-gray-400 mb-8 text-lg font-medium text-center">
					{message}
				</p>

				<div className="w-full space-y-4">
					{/* Score Card */}
					<div className="bg-gray-800/60 backdrop-blur-sm p-5 rounded-xl border border-gray-700 flex justify-between items-center">
						<span className="text-gray-400 font-bold uppercase text-sm tracking-wider">
							Final Score
						</span>
						<span className="text-3xl font-black text-blue-400">
							{score}
						</span>
					</div>

					{/* Rank Card */}
					{rank && (
						<div className="bg-gray-800/60 backdrop-blur-sm p-5 rounded-xl border border-gray-700 flex justify-between items-center">
							<span className="text-gray-400 font-bold uppercase text-sm tracking-wider">
								Rank
							</span>
							<span className="text-3xl font-black text-white">
								#{rank}
							</span>
						</div>
					)}
				</div>

				<Link
					href="/"
					className="mt-10 w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-center hover:bg-gray-200 transition-all shadow-lg active:scale-95">
					Back to Home
				</Link>
			</div>
		</div>
	);
}
