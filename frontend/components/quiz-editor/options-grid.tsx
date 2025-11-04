"use client";

import { Option } from "@/lib/types/quiz";
import { CreateOptionDto, UpdateOptionDto } from "@/lib/dtos/quiz.dto";
import { PlaceholderOptionCard, RealOptionCard } from "./option-card";

interface OptionsGridProps {
	options: Option[];
	onOptionMutate: (data: {
		optionId: number;
		payload: UpdateOptionDto;
	}) => void;
	onAddOptionMutate: (payload: CreateOptionDto) => void;
	isAddingOption: boolean;
	onOptionDelete: (data: { optionId: number }) => void;
}

export default function OptionsGrid({
	options,
	onOptionMutate,
	onAddOptionMutate,
	isAddingOption,
	onOptionDelete,
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
					onDelete={onOptionDelete}
					optionsCount={options.length}
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
