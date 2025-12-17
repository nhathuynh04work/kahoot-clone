"use client";

import { Loader2, CheckCircle2 } from "lucide-react";

export const PlayerSubmittedScreen = () => {
	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg flex flex-col items-center text-center">
				<div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6">
					<CheckCircle2 size={32} />
				</div>

				<h2 className="text-2xl font-bold text-white mb-2">
					Answer Submitted
				</h2>
				<p className="text-gray-400 mb-8">Did you get it right?</p>

				<div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-700">
					<Loader2 className="animate-spin" size={16} />
					<span>Waiting for others...</span>
				</div>
			</div>
		</div>
	);
};
