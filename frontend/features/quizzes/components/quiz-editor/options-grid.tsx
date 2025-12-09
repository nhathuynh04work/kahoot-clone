"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { PlaceholderOptionCard, RealOptionCard } from "./option-card";
import { QuizFullDetails } from "@/features/quizzes/types";

interface OptionsGridProps {
	questionIndex: number;
}

export default function OptionsGrid({ questionIndex }: OptionsGridProps) {
	const { control, getValues, setValue } = useFormContext<QuizFullDetails>();

	const { fields, append, remove } = useFieldArray({
		control,
		name: `questions.${questionIndex}.options`,
	});

	const handleAddOption = () => {
		append({
			id: Date.now() * -1,
			questionId: 0,
			text: "New Option",
			isCorrect: false,
			sortOrder: fields.length,
		});
	};

	const handleRemoveOption = (index: number) => {
		if (fields.length <= 2) return;

		const currentOptions = getValues(`questions.${questionIndex}.options`);
		const optionToRemove = currentOptions[index];

		if (optionToRemove?.isCorrect) {
			const newCorrectIndex = index === 0 ? 1 : 0;

			setValue(
				`questions.${questionIndex}.options.${newCorrectIndex}.isCorrect`,
				true,
				{ shouldDirty: true }
			);
		}

		remove(index);
	};

	return (
		<div className="w-full grid grid-cols-2 gap-4">
			{fields.map((field, index) => (
				<div key={field.id} className="relative">
					<RealOptionCard
						questionIndex={questionIndex}
						optionIndex={index}
						onDelete={() => handleRemoveOption(index)}
					/>
				</div>
			))}

			{fields.length < 4 && (
				<PlaceholderOptionCard
					index={fields.length}
					onAdd={handleAddOption}
					disabled={false}
				/>
			)}
		</div>
	);
}
