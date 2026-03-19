"use client";

import { CheckCircle2 } from "lucide-react";
import type { Option, Question } from "@/features/quizzes/types";
import { optionColors } from "@/lib/option-colors";

export function QuestionPreview({
	question,
	options,
}: {
	question: Pick<Question, "text"> | null | undefined;
	options?: Option[] | null;
}) {
	const sortedOptions = options
		? [...options].sort((a, b) => a.sortOrder - b.sortOrder)
		: [];

	return (
		<div className="flex flex-col items-center gap-6">
			<p className="text-white text-center text-lg font-semibold leading-snug max-w-xl">
				{question?.text || "(No text)"}
			</p>

			{sortedOptions.length > 0 ? (
				<div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
					{sortedOptions.map((opt, idx) => {
						const colorClass = optionColors[idx % 4];

						return (
							<div
								key={opt.id}
								className="p-4 rounded-md border border-gray-700 bg-gray-900 flex items-start gap-3 shadow-sm transition-colors">
								<div
									className={`w-10 h-10 rounded-md shrink-0 mt-0.5 ${colorClass}`}
								/>

								<div className="min-w-0 flex-1">
									<p className="text-white text-base font-medium wrap-break-word">
										{opt.text || "(No text)"}
									</p>
								</div>

								{opt.isCorrect && (
									<CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
								)}
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-gray-400 text-sm text-center">
					No options.
				</p>
			)}
		</div>
	);
}

