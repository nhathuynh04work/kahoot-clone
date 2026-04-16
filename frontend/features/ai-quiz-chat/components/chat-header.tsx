"use client";

import { X, Sparkles } from "lucide-react";

interface ChatHeaderProps {
	onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
	return (
		<header className="flex items-center justify-between shrink-0 h-14 px-4 border-b border-(--app-border) bg-(--app-surface)">
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
					<Sparkles className="w-5 h-5 text-indigo-400" />
				</div>
				<h1 className="font-semibold text-(--app-fg)">AI Quiz Generator</h1>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="p-2 rounded-lg text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors"
				aria-label="Close"
			>
				<X className="w-5 h-5" />
			</button>
		</header>
	);
}
