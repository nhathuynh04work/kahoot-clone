"use client";

import { useFormContext } from "react-hook-form";
import type { QuizFullDetails, QuestionType } from "@/features/quizzes/types";

export function QuestionTypeFields({ questionIndex }: { questionIndex: number }) {
	const { watch, register } = useFormContext<QuizFullDetails>();
	const prefix = `questions.${questionIndex}` as const;
	const type =
		(watch(`${prefix}.type`) as QuestionType | undefined) ?? "MULTIPLE_CHOICE";

	if (type === "MULTIPLE_CHOICE") return null;

	return (
		<div className="w-full max-w-2xl mx-auto px-4 space-y-4 border border-gray-700 rounded-xl p-4 bg-gray-950/40">
			{type === "SHORT_ANSWER" ? (
				<div>
					<label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
						Correct answer (case-insensitive match)
					</label>
					<input
						{...register(`${prefix}.correctText`)}
						className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
						placeholder="Expected answer"
					/>
				</div>
			) : null}

			{type === "NUMERIC_RANGE" ? (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
					<div>
						<label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
							Min
						</label>
						<input
							type="number"
							step="any"
							{...register(`${prefix}.rangeMin`, {
								valueAsNumber: true,
							})}
							className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
						/>
					</div>
					<div>
						<label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
							Max
						</label>
						<input
							type="number"
							step="any"
							{...register(`${prefix}.rangeMax`, {
								valueAsNumber: true,
							})}
							className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
						/>
					</div>
					<label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
						<input
							type="checkbox"
							{...register(`${prefix}.rangeInclusive`)}
							className="rounded border-gray-600"
						/>
						Inclusive bounds
					</label>
				</div>
			) : null}
		</div>
	);
}
