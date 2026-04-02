"use client";

import { Loader2, User } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";

interface PlayerWaitingScreenProps {
	nickname: string;
	pin: string;
}

export const PlayerWaitingScreen = ({
	nickname,
	pin,
}: PlayerWaitingScreenProps) => {
	return (
		<div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center relative overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-600/15 via-gray-950/0 to-indigo-500/10" />

			<div className="w-full max-w-md rounded-3xl border-2 border-gray-700 bg-gray-800 p-8 shadow-xl text-center relative z-10">
				<div className="mb-6 select-none">
					<AppLogo className="text-3xl font-extrabold tracking-tight" />
				</div>

				<div className="w-16 h-16 bg-blue-500/20 text-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-blue-500/30">
					<User size={32} />
				</div>

				<h1 className="text-2xl font-bold text-white mb-2">
					You&apos;re in!
				</h1>
				<p className="text-gray-400 mb-8">
					See your name on the host screen?
				</p>

				<div className="bg-gray-900 rounded-2xl p-4 border-2 border-gray-700 flex items-center justify-center gap-3 shadow-sm">
					<span className="text-xl font-black text-white">
						{nickname}
					</span>
				</div>

				<div className="mt-4 text-sm text-gray-300 font-semibold">
					Game PIN: <span className="font-mono font-black tracking-widest">{pin}</span>
				</div>

				<div className="mt-6 flex items-center justify-center gap-2 text-indigo-200 text-sm font-semibold">
					<Loader2 size={16} className="animate-spin" />
					<span>Waiting for host…</span>
				</div>
			</div>
		</div>
	);
};
