"use client";

import { Option } from "@/lib/types/quiz";
import { CheckCircle } from "lucide-react";

interface OptionButtonProps {
	option: Option;
	isHostView?: boolean;
	isDisabled?: boolean;
	onClick?: (optionId: number) => void;
}

export default function OptionButton({
	option,
	isHostView = false,
	isDisabled = false,
	onClick,
}: OptionButtonProps) {
	const disabled = isHostView || isDisabled;

	let baseStyle = "p-6 rounded-lg text-2xl font-semibold text-left";
	let hoverStyle = "";

	if (isHostView) {
		// HOST STYLING:
		// Always show the correct answer.
		baseStyle += option.isCorrect
			? " bg-green-700 border-4 border-green-300"
			: " bg-gray-800";
	} else {
		// PLAYER STYLING:
		// Interactive button, with styles for disabled state.
		baseStyle += " bg-indigo-600";
		hoverStyle = " hover:bg-indigo-700 transition";

		if (disabled) {
			baseStyle += " opacity-50 cursor-not-allowed";
			hoverStyle = "";
		}
	}

	return (
		<button
			key={option.id}
			disabled={disabled}
			onClick={() => onClick?.(option.id)}
			className={`${baseStyle} ${hoverStyle}`}>
			{option.text}
			{isHostView && option.isCorrect && (
				<CheckCircle className="w-8 h-8 inline-block ml-4 text-green-300" />
			)}
		</button>
	);
}
