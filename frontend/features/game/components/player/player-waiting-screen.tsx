"use client";

import { Loader2, User } from "lucide-react";

interface PlayerWaitingScreenProps {
	nickname: string;
}

export const PlayerWaitingScreen = ({ nickname }: PlayerWaitingScreenProps) => {
	return (
		<div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
			<div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg text-center">
				<div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
					<User size={32} />
				</div>

				<h1 className="text-2xl font-bold text-white mb-2">
					You&apos;re in!
				</h1>
				<p className="text-gray-400 mb-8">
					See your name on the host screen?
				</p>

				<div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-center justify-center gap-3">
					<span className="text-lg font-mono font-semibold text-white">
						{nickname}
					</span>
				</div>

				<div className="mt-8 flex items-center justify-center gap-2 text-indigo-400 text-sm animate-pulse">
					<Loader2 size={16} className="animate-spin" />
					<span>Waiting for game to start...</span>
				</div>
			</div>
		</div>
	);
};
