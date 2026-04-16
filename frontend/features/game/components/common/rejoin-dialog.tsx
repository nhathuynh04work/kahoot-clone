"use client";

import { History, LogOut } from "lucide-react";

interface RejoinDialogProps {
	onContinue: () => void;
	onStartFresh: () => void;
}

export function RejoinDialog({ onContinue, onStartFresh }: RejoinDialogProps) {
	let nickname = "Player";
	try {
		const stored = localStorage.getItem("recovery");
		if (stored) nickname = JSON.parse(stored).nickname;
	} catch {}

	return (
		<div className="w-full max-w-sm p-8 bg-(--app-elevated) rounded-2xl shadow-xl border border-(--app-border) animate-in zoom-in-95 duration-300">
			<div className="text-center mb-8">
				<div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
					<History size={32} />
				</div>
				<h1 className="text-2xl font-bold text-(--app-fg) mb-2">
					Welcome Back!
				</h1>
				<p className="text-(--app-fg-muted)">
					It looks like you were disconnected.
				</p>
			</div>

			<div className="flex flex-col gap-3">
				<button
					onClick={onContinue}
					className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
					Continue as{" "}
					<span className="underline decoration-indigo-300 underline-offset-2">
						{nickname}
					</span>
				</button>

				<button
					onClick={onStartFresh}
					className="w-full py-3 rounded-xl font-semibold text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors flex items-center justify-center gap-2">
					<LogOut size={18} />
					No, start fresh
				</button>
			</div>
		</div>
	);
}
