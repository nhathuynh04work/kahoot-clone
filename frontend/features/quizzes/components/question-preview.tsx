"use client";

import { CheckCircle2 } from "lucide-react";
import type { Option, Question } from "@/features/quizzes/types";
import { optionColors } from "@/lib/option-colors";

/** Renders options in a compact list (e.g. quiz details drawer). */
function QuestionOptionsCompact({
	options,
	isRevealed,
}: {
	options: Option[];
	isRevealed: boolean;
}) {
	return (
		<div className="w-full divide-y divide-gray-700/60">
			{options.map((opt, idx) => {
				const colorClass = optionColors[idx % 4];
				const isCorrect = opt.isCorrect;

				return (
					<div
						key={opt.id}
						className={`flex items-center gap-3 px-3 py-2 min-w-0 ${
							isRevealed
								? isCorrect
									? "bg-emerald-500/10"
									: "bg-gray-900/50 opacity-60"
								: "bg-transparent"
						}`}
					>
						<div className="flex items-center gap-3 min-w-0">
							<div
								className={`relative w-9 h-9 rounded-md shrink-0 ${colorClass}`}
							>
								{isRevealed && isCorrect ? (
									<CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-white" />
								) : null}
							</div>
							<p className="text-sm text-white truncate min-w-0 flex-1">
								{opt.text?.trim() || "-"}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/** Default grid layout for host / play surfaces. */
function QuestionOptionsGrid({
	options,
	isRevealed,
}: {
	options: Option[];
	isRevealed: boolean;
}) {
	return (
		<div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
			{options.map((opt, idx) => {
				const colorClass = optionColors[idx % 4];
				const isCorrect = opt.isCorrect;

				return (
					<div
						key={opt.id}
						className={`p-4 rounded-md border flex items-start gap-3 shadow-sm transition-colors ${
							isRevealed
								? isCorrect
									? "border-emerald-500/60 bg-emerald-500/10"
									: "border-gray-700 bg-gray-900/50 opacity-60"
								: "border-gray-700 bg-gray-900"
						}`}
					>
						<div
							className={`w-10 h-10 rounded-md shrink-0 mt-0.5 ${colorClass}`}
						/>

						<div className="min-w-0 flex-1">
							<p className="text-white text-base font-medium wrap-break-word">
								{opt.text?.trim() || "-"}
							</p>
						</div>

						{isRevealed && isCorrect && (
							<CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
						)}
					</div>
				);
			})}
		</div>
	);
}

export type QuestionPreviewProps = {
	/** Question stem; optional when `showQuestionText` is false. */
	question?: Pick<Question, "text"> | null;
	options?: Option[] | null;
	revealCorrect?: boolean;
	showQuestionText?: boolean;
	variant?: "default" | "compact";
};

/**
 * Pure presentational preview of a question and its options.
 * Driven only by props (no effects) so it is safe to embed in editors and live views.
 */
export function QuestionPreview({
	question,
	options,
	revealCorrect = false,
	showQuestionText = true,
	variant = "default",
}: QuestionPreviewProps) {
	const sortedOptions = options
		? [...options].sort((a, b) => a.sortOrder - b.sortOrder)
		: [];

	const isRevealed = revealCorrect;

	return (
		<div className="flex flex-col items-center gap-6">
			{showQuestionText && (
				<p className="text-white text-center text-lg font-semibold leading-snug max-w-xl">
					{question?.text?.trim() || "-"}
				</p>
			)}

			{sortedOptions.length > 0 ? (
				variant === "compact" ? (
					<QuestionOptionsCompact
						options={sortedOptions}
						isRevealed={isRevealed}
					/>
				) : (
					<QuestionOptionsGrid
						options={sortedOptions}
						isRevealed={isRevealed}
					/>
				)
			) : (
				<p className="text-gray-400 text-sm text-center">No options.</p>
			)}
		</div>
	);
}
