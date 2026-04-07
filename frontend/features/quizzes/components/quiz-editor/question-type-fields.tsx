"use client";

import { useFormContext } from "react-hook-form";
import type { QuizFullDetails, QuestionType } from "@/features/quizzes/types";
import { cn } from "@/lib/utils";

function toFiniteNumber(value: unknown, fallback: number) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const n = parseFloat(value);
		if (Number.isFinite(n)) return n;
	}
	return fallback;
}

function InlineToggle({
	checked,
	onCheckedChange,
	label,
	description,
}: {
	checked: boolean;
	onCheckedChange: (next: boolean) => void;
	label: string;
	description?: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
				checked
					? "border-indigo-500/60 bg-indigo-500/10"
					: "border-gray-700 bg-gray-900/30 hover:bg-gray-800/40",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
			)}
		>
			<span className="min-w-0">
				<span className="block text-sm font-semibold text-gray-200">{label}</span>
				{description ? (
					<span className="block text-xs text-gray-500 mt-0.5">
						{description}
					</span>
				) : null}
			</span>
			<span
				aria-hidden
				className={cn(
					"relative shrink-0 h-6 w-11 rounded-full border transition-colors",
					checked
						? "bg-indigo-500/80 border-indigo-400/60"
						: "bg-gray-800 border-gray-700",
				)}
			>
				<span
					className={cn(
						"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
						checked ? "translate-x-5" : "translate-x-0.5",
					)}
				/>
			</span>
		</button>
	);
}

export function QuestionTypeFields({ questionIndex }: { questionIndex: number }) {
	const { watch, register, setValue } = useFormContext<QuizFullDetails>();
	const prefix = `questions.${questionIndex}` as const;
	const type =
		(watch(`${prefix}.type`) as QuestionType | undefined) ?? "MULTIPLE_CHOICE";

	if (type !== "SHORT_ANSWER" && type !== "NUMBER_INPUT") return null;

	return (
		<div className="w-full max-w-2xl mx-auto px-4 space-y-3">
			{type === "SHORT_ANSWER" ? (
				<div>
					<label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
						Correct answer
					</label>
					<input
						{...register(`${prefix}.correctText`)}
						className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
						placeholder="Expected answer"
					/>
				</div>
			) : null}

			{type === "NUMBER_INPUT" ? (
				<div className="space-y-3">
					<div>
						<label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
							Correct number
						</label>
						<input
							type="number"
							step="any"
							{...register(`${prefix}.correctNumber`, {
								valueAsNumber: true,
							})}
							className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
							placeholder="0"
						/>
						<p className="text-[11px] text-gray-500 mt-1">
							Player must match this exactly unless “Allow range” is enabled in the sidebar.
						</p>
					</div>

					{watch(`${prefix}.allowRange`) === true ? (
						(() => {
							const correct = toFiniteNumber(watch(`${prefix}.correctNumber`), 0);
							const proximity = Math.max(
								0,
								toFiniteNumber(watch(`${prefix}.rangeProximity`), 0),
							);
							const min = correct - proximity;
							const max = correct + proximity;
							return (
								<div className="rounded-xl border border-gray-700 bg-gray-900/30 px-3 py-2">
									<p className="text-xs text-gray-500 uppercase tracking-wide">
										Accepted range
									</p>
									<p className="text-sm text-gray-200 mt-1 tabular-nums">
										{min} to {max} (inclusive)
									</p>
								</div>
							);
						})()
					) : null}
				</div>
			) : null}
		</div>
	);
}
