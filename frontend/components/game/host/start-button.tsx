"use client";

import { Play } from "lucide-react";

export default function StartButton({
	disabled = false,
	onClick,
}: {
	disabled: boolean;
	onClick: () => void;
}) {
	return (
		<button
			className="flex items-center space-x-2 px-6 py-2 bg-green-600 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
			disabled={disabled}
			onClick={onClick}>
			<Play className="w-5 h-5" />
			<span>Start Game</span>
		</button>
	);
}
