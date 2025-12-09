"use client";

import { useFormContext } from "react-hook-form";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";

const optionColors = [
	"bg-red-800",
	"bg-blue-800",
	"bg-yellow-800",
	"bg-green-800",
];

interface RealOptionCardProps {
	questionIndex: number;
	optionIndex: number;
	onDelete: () => void;
}

export function RealOptionCard({
	questionIndex,
	optionIndex,
	onDelete,
}: RealOptionCardProps) {
	const { register, watch, setValue, getValues } =
		useFormContext<QuizFullDetails>();

	const isCorrect = watch(
		`questions.${questionIndex}.options.${optionIndex}.isCorrect`
	);
	const colorClass = optionColors[optionIndex % 4];

	const { onChange, onBlur, name, ref } = register(
		`questions.${questionIndex}.options.${optionIndex}.text`
	);

	const handleToggleCorrect = () => {
		if (isCorrect) {
			setValue(
				`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
				false,
				{ shouldDirty: true }
			);

			return;
		}

		const currentOptions = getValues(`questions.${questionIndex}.options`);

		currentOptions.forEach((_, idx) => {
			if (idx !== optionIndex) {
				setValue(
					`questions.${questionIndex}.options.${idx}.isCorrect`,
					false,
					{ shouldDirty: true }
				);
			}
		});

		setValue(
			`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
			true,
			{ shouldDirty: true }
		);
	};

	return (
		<div className="p-4 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-3 shadow-sm group transition-colors focus-within:border-gray-500">
			<div className={`w-10 h-10 rounded-md shrink-0 ${colorClass}`} />

			<input
				type="text"
				name={name}
				ref={ref}
				onChange={onChange}
				onBlur={(e) => {
					onBlur(e);
					if (!e.target.value.trim()) {
						onDelete();
					}
				}}
				placeholder={`Option ${optionIndex + 1}`}
				className="grow bg-transparent text-white text-lg font-medium placeholder:text-gray-500 focus:outline-none"
				autoComplete="off"
			/>

			<button
				type="button"
				onClick={handleToggleCorrect}
				className="shrink-0 transition-transform active:scale-95"
				title={isCorrect ? "Correct answer" : "Mark as correct"}>
				{isCorrect ? (
					<CheckCircle className="w-7 h-7 text-green-500" />
				) : (
					<Circle className="w-7 h-7 text-gray-600 hover:text-gray-400" />
				)}
			</button>
		</div>
	);
}

export function PlaceholderOptionCard({
	index,
	onAdd,
	disabled,
}: {
	index: number;
	onAdd: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onAdd}
			disabled={disabled}
			className="w-full h-full p-4 rounded-md border border-gray-700 bg-gray-900/50 flex items-center gap-3 
                       opacity-50 hover:opacity-100 hover:bg-gray-800 transition-all cursor-pointer group disabled:cursor-not-allowed">
			<div
				className={`w-10 h-10 rounded-md ${
					optionColors[index % 4]
				} opacity-50`}
			/>
			<span className="text-gray-500 text-lg font-medium group-hover:text-gray-300">
				Add option
			</span>
			<Plus className="ml-auto w-5 h-5 text-gray-500" />
		</button>
	);
}
