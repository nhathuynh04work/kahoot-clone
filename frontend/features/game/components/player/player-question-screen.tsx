"use client";

import { useState } from "react";
import { QuestionWithOptions } from "@/features/quizzes/types";
import { Circle, Square, Triangle, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerQuestionScreenProps {
	question: QuestionWithOptions;
	onSelectOption: (mcSelectedIndex: number) => void;
	onSubmitText: (text: string) => void;
	onSubmitNumeric: (value: number) => void;
}

export const PlayerQuestionScreen = ({
	question,
	onSelectOption,
	onSubmitText,
	onSubmitNumeric,
}: PlayerQuestionScreenProps) => {
	const qType = question.type ?? "MULTIPLE_CHOICE";
	const [textDraft, setTextDraft] = useState("");

	const allowRange = question.allowRange === true;
	const step = 1;

	const initial = (() => {
		const c =
			typeof question.correctNumber === "number"
				? question.correctNumber
				: typeof question.correctNumber === "string"
					? parseFloat(question.correctNumber)
					: 0;
		return Number.isFinite(c) ? c : 0;
	})();

	const [numValue, setNumValue] = useState<number>(initial);
	const [numDraft, setNumDraft] = useState<string>(String(initial));

	const icons = [Triangle, Hexagon, Circle, Square];
	const styles = [
		"bg-red-400 hover:bg-red-500 active:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 dark:active:bg-red-700",
		"bg-blue-400 hover:bg-blue-500 active:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 dark:active:bg-blue-700",
		"bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:active:bg-yellow-600",
		"bg-green-400 hover:bg-green-500 active:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 dark:active:bg-green-700",
	];

	return (
		<div className="min-h-screen bg-(--app-bg) p-4 flex flex-col">
			<div className="bg-(--app-surface-muted) border-b border-(--app-border) p-4 -mx-4 -mt-4 mb-4 text-center">
				<p className="text-(--app-fg) font-medium text-sm md:text-base line-clamp-4">
					{question.text}
				</p>
				{qType === "SHORT_ANSWER" ? (
					<p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">Short answer</p>
				) : null}
				{qType === "NUMBER_INPUT" ? (
					<p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">Enter a number</p>
				) : null}
				{qType === "TRUE_FALSE" ? (
					<p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">True or false</p>
				) : null}
			</div>

			{qType === "MULTIPLE_CHOICE" || qType === "TRUE_FALSE" ? (
				<div className="flex-1 grid grid-cols-2 gap-4">
					{question.options.map((o, i) => {
						const Icon = icons[i % 4];
						return (
							<button
								key={o.id}
								type="button"
								onClick={() => onSelectOption(i)}
								className={`${
									styles[i % 4]
								} rounded-xl flex flex-col items-center justify-center p-4 transition-transform active:scale-95 shadow-md`}>
								<Icon
									size={48}
									className="text-white/90 mb-2 fill-current drop-shadow-[0_1px_0_rgba(0,0,0,0.12)]"
								/>
								<span className="text-white font-bold text-lg leading-tight text-center drop-shadow-sm">
									{o.text}
								</span>
							</button>
						);
					})}
				</div>
			) : null}

			{qType === "SHORT_ANSWER" ? (
				<div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
					<input
						type="text"
						value={textDraft}
						onChange={(e) => setTextDraft(e.target.value)}
						className="w-full rounded-xl bg-(--app-input-bg) border border-(--app-border) px-4 py-3 text-(--app-fg) text-lg"
						placeholder="Your answer"
						autoComplete="off"
					/>
					<button
						type="button"
						onClick={() => onSubmitText(textDraft)}
						disabled={!textDraft.trim()}
						className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-semibold text-white">
						Submit
					</button>
				</div>
			) : null}

			{qType === "NUMBER_INPUT" ? (
				<div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
					<div className="rounded-2xl border border-(--app-border) bg-(--app-surface-muted)/70 p-5">
						<p className="text-center text-(--app-fg-muted) text-xs uppercase tracking-wider">
							Your answer
						</p>
						<p className="text-center text-(--app-fg) font-extrabold text-5xl mt-2 tabular-nums">
							{numValue}
						</p>

						<div className="mt-6 grid grid-cols-3 gap-3 items-center">
							<button
								type="button"
								onClick={() => {
									const next = numValue - step;
									setNumValue(next);
									setNumDraft(String(next));
								}}
								className={cn(
									"h-12 rounded-xl border border-(--app-border) bg-(--app-surface-muted) hover:bg-(--app-surface) text-(--app-fg) font-extrabold text-2xl",
								)}
								aria-label="Decrease"
							>
								−
							</button>

							<input
								type="text"
								inputMode="decimal"
								value={numDraft}
								onChange={(e) => setNumDraft(e.target.value)}
								onBlur={() => {
									const n = parseFloat(numDraft);
									if (!Number.isFinite(n)) {
										setNumDraft(String(numValue));
										return;
									}
									setNumValue(n);
									setNumDraft(String(n));
								}}
								className="h-12 w-full rounded-xl bg-(--app-input-bg) border border-(--app-border) px-4 text-(--app-fg) text-lg text-center tabular-nums"
								aria-label="Number input"
							/>

							<button
								type="button"
								onClick={() => {
									const next = numValue + step;
									setNumValue(next);
									setNumDraft(String(next));
								}}
								className={cn(
									"h-12 rounded-xl border border-(--app-border) bg-(--app-surface-muted) hover:bg-(--app-surface) text-(--app-fg) font-extrabold text-2xl",
								)}
								aria-label="Increase"
							>
								+
							</button>
						</div>

						{allowRange ? (
							<p className="mt-3 text-xs text-(--app-fg-muted) text-center">
								Answers within the allowed range are accepted.
							</p>
						) : null}
					</div>
					<button
						type="button"
						onClick={() => {
							if (Number.isFinite(numValue)) onSubmitNumeric(numValue);
						}}
						disabled={!Number.isFinite(numValue)}
						className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-semibold text-white">
						Submit
					</button>
				</div>
			) : null}
		</div>
	);
};
