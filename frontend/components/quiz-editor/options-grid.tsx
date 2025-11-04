"use client";

import { Option } from "@/lib/types/quiz";
import { CreateOptionDto, UpdateOptionDto } from "@/lib/dtos/quiz.dto";
import RealOptionCard from "./real-option-card";
import PlaceholderOptionCard from "./placeholder-option-card";

export const optionColors = [
	"bg-red-800",
	"bg-blue-800",
	"bg-yellow-800",
	"bg-green-800",
];

interface OptionsGridProps {
	options: Option[];
	onOptionMutate: (data: {
		optionId: number;
		payload: UpdateOptionDto;
	}) => void;
	onAddOptionMutate: (payload: CreateOptionDto) => void;
	isAddingOption: boolean;
}

export default function OptionsGrid({
	options,
	onOptionMutate,
	onAddOptionMutate,
	isAddingOption,
}: OptionsGridProps) {
	return (
		<div className="w-full grid grid-cols-2 gap-4">
			{/* render real options */}
			{options.map((option, index) => (
				<RealOptionCard
					key={option.id}
					option={option}
					index={index}
					onMutate={onOptionMutate}
				/>
			))}

			{/* render placeholder */}
			{options.length < 4 && (
				<PlaceholderOptionCard
					key="placeholder"
					index={options.length}
					onAdd={onAddOptionMutate}
					disabled={isAddingOption}
				/>
			)}
		</div>
	);
}


