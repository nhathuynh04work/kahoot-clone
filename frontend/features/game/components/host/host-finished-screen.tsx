"use client";

import { Player } from "../../types";
import { Trophy, Medal, Award } from "lucide-react";

interface HostFinishedScreenProps {
	leaderboard: Player[];
}

export const HostFinishedScreen = ({
	leaderboard,
}: HostFinishedScreenProps) => {
	const top3 = leaderboard.slice(0, 3);

	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 overflow-hidden">
			<div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-700">
				<h1 className="text-5xl font-black text-white mb-4 tracking-tight">
					Podium
				</h1>
				<p className="text-gray-400 text-lg">
					Congratulations to the winners!
				</p>
			</div>

			{/* Podium Container */}
			<div className="flex items-end justify-center gap-4 md:gap-8 h-[50vh] w-full max-w-4xl px-4 border-b border-gray-700 pb-px">
				{/* 2nd Place */}
				<div className="flex flex-col items-center w-1/3 h-2/3 animate-in slide-in-from-bottom-full duration-1000 delay-300 fill-mode-forwards ease-out">
					{top3[1] && (
						<>
							<div className="mb-4 text-center animate-in fade-in duration-500 delay-1000">
								<div className="font-bold text-white text-xl md:text-2xl truncate max-w-[150px]">
									{top3[1].nickname}
								</div>
								<div className="text-gray-400 font-mono">
									{top3[1].points} pts
								</div>
							</div>
							<div className="w-full h-full bg-gray-800 rounded-t-lg border-t-4 border-gray-500 relative flex justify-center pt-6 shadow-2xl">
								<Medal className="text-gray-400 w-12 h-12 md:w-16 md:h-16" />
								<span className="absolute bottom-4 text-6xl font-black text-gray-700 select-none opacity-50">
									2
								</span>
							</div>
						</>
					)}
				</div>

				{/* 1st Place */}
				<div className="flex flex-col items-center w-1/3 h-full animate-in slide-in-from-bottom-full duration-1000 delay-500 fill-mode-forwards ease-out z-10">
					{top3[0] && (
						<>
							<div className="mb-4 text-center animate-in fade-in zoom-in duration-500 delay-1000">
								<Trophy className="text-yellow-400 w-16 h-16 mx-auto mb-2 drop-shadow-lg animate-bounce" />
								<div className="font-black text-yellow-400 text-2xl md:text-4xl truncate max-w-[200px]">
									{top3[0].nickname}
								</div>
								<div className="text-yellow-500/80 font-mono text-lg font-bold">
									{top3[0].points} pts
								</div>
							</div>
							<div className="w-full h-full bg-indigo-900/80 rounded-t-lg border-t-4 border-yellow-400 relative flex justify-center pt-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
								<span className="absolute bottom-4 text-8xl font-black text-indigo-950 select-none opacity-50">
									1
								</span>
							</div>
						</>
					)}
				</div>

				{/* 3rd Place */}
				<div className="flex flex-col items-center w-1/3 h-1/2 animate-in slide-in-from-bottom-full duration-1000 delay-100 fill-mode-forwards ease-out">
					{top3[2] && (
						<>
							<div className="mb-4 text-center animate-in fade-in duration-500 delay-1000">
								<div className="font-bold text-white text-xl md:text-2xl truncate max-w-[150px]">
									{top3[2].nickname}
								</div>
								<div className="text-gray-400 font-mono">
									{top3[2].points} pts
								</div>
							</div>
							<div className="w-full h-full bg-gray-800 rounded-t-lg border-t-4 border-orange-700 relative flex justify-center pt-6 shadow-2xl">
								<Award className="text-orange-700 w-12 h-12 md:w-16 md:h-16" />
								<span className="absolute bottom-4 text-6xl font-black text-gray-700 select-none opacity-50">
									3
								</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
