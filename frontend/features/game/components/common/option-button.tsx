"use client";

import { Option } from "@/features/quizzes/types";
import { Square, Triangle, Circle, Diamond } from "lucide-react";

interface OptionButtonProps {
	option: Option;
	index?: number;
	disabled?: boolean;
	className?: string;
	onClick?: (optionId: number) => void;
}

export default function OptionButton({
	option,
	index = 0,
	disabled = false,
	className = "",
	onClick,
}: OptionButtonProps) {
	const colors = [
		"bg-red-600 border-red-800",
		"bg-blue-600 border-blue-800",
		"bg-yellow-600 border-yellow-800",
		"bg-green-600 border-green-800",
	];

	const colorClass = colors[index % 4];

	let baseStyle = `relative p-6 rounded-lg text-2xl font-bold text-left text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] transition-all transform active:translate-y-1 active:shadow-none border-b-4 ${colorClass}`;

	if (disabled) {
		baseStyle +=
			" cursor-not-allowed opacity-80 active:translate-y-0 active:shadow-[0_4px_0_0_rgba(0,0,0,0.2)]";
	} else {
		baseStyle += " hover:brightness-110";
	}

	return (
		<button
			key={option.id}
			disabled={disabled}
			onClick={() => !disabled && onClick?.(option.id)}
			className={`${baseStyle} ${className}`}>
			<div className="flex items-center gap-4">
				{/* Shape Icon based on Index */}
				<div className="hidden sm:block">
					{index % 4 === 0 && (
						<Triangle className="w-6 h-6 fill-current" />
					)}
					{index % 4 === 1 && (
						<Diamond className="w-6 h-6 fill-current" />
					)}
					{index % 4 === 2 && (
						<Circle className="w-6 h-6 fill-current" />
					)}
					{index % 4 === 3 && (
						<Square className="w-6 h-6 fill-current" />
					)}
				</div>

				<span className="flex-1">{option.text}</span>
			</div>
		</button>
	);
}
