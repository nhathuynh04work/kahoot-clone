"use client";

import { X, Sparkles } from "lucide-react";

interface ChatHeaderProps {
	onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
	return (
		<header className="flex items-center justify-between shrink-0 h-14 px-4 border-b border-gray-700 bg-gray-800">
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
					<Sparkles className="w-5 h-5 text-indigo-400" />
				</div>
				<h1 className="font-semibold text-white">AI Quiz Generator</h1>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
				aria-label="Close"
			>
				<X className="w-5 h-5" />
			</button>
		</header>
	);
}
