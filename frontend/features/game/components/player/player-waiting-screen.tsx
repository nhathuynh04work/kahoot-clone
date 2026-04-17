"use client";

import { Loader2, User } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface PlayerWaitingScreenProps {
	nickname: string;
	pin: string;
}

export const PlayerWaitingScreen = ({
	nickname,
	pin,
}: PlayerWaitingScreenProps) => {
	return (
		<div className="min-h-screen bg-transparent p-4 flex items-center justify-center relative overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/12 via-transparent to-indigo-500/8" />

			<div className="fixed bottom-4 left-4 z-50">
				<ThemeToggle compact />
			</div>

			<div className="w-full max-w-md rounded-3xl border-2 border-(--app-border) bg-(--app-elevated) p-8 shadow-xl text-center relative z-10">
				<div className="mb-6 select-none">
					<AppLogo className="text-3xl font-extrabold tracking-tight" />
				</div>

				<div className="w-16 h-16 bg-blue-500/15 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30">
					<User size={32} />
				</div>

				<h1 className="text-2xl font-bold text-(--app-fg) mb-2">
					You&apos;re in!
				</h1>
				<p className="text-(--app-fg-muted) mb-8">
					See your name on the host screen?
				</p>

				<div className="bg-(--app-surface-muted) rounded-2xl p-4 border-2 border-(--app-border) flex items-center justify-center gap-3 shadow-sm">
					<span className="text-xl font-black text-(--app-fg)">
						{nickname}
					</span>
				</div>

				<div className="mt-4 text-sm text-(--app-fg-muted) font-semibold">
					Game PIN: <span className="font-mono font-black tracking-widest">{pin}</span>
				</div>

				<div className="mt-6 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-300 text-sm font-semibold">
					<Loader2 size={16} className="animate-spin" />
					<span>Waiting for host…</span>
				</div>
			</div>
		</div>
	);
};
