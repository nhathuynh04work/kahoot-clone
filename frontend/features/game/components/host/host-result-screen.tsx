"use client";

import {
	ArrowRight,
	BarChart2,
	Check,
	Circle,
	Hexagon,
	Square,
	Triangle,
} from "lucide-react";
import type { QuestionWithOptions } from "@/features/quizzes/types";
import type { QuestionResultMeta } from "@/features/game/types";

interface HostResultScreenProps {
	question: QuestionWithOptions;
	meta: QuestionResultMeta | null;
	stats: Record<string, string>;
	onNext: () => void;
}

const getBarColor = (index: number) => {
	const colors = [
		"bg-red-500",
		"bg-blue-500",
		"bg-yellow-500",
		"bg-green-500",
	];
	return colors[index % 4];
};

const getIcon = (index: number) => {
	const icons = [Triangle, Hexagon, Circle, Square];
	return icons[index % 4];
};

export const HostResultScreen = ({
	question,
	meta,
	stats,
	onNext,
}: HostResultScreenProps) => {
	const qType =
		meta?.questionType ?? question.type ?? "MULTIPLE_CHOICE";

	const mcLike = qType === "MULTIPLE_CHOICE" || qType === "TRUE_FALSE";
	const showSubmittedAnswerCards =
		qType === "SHORT_ANSWER" || qType === "NUMBER_INPUT";

	if (mcLike) {
		const correctSet = new Set<number>(
			meta?.correctOptionIndices?.length
				? meta.correctOptionIndices
				: meta?.correctOptionIndex != null
					? [meta.correctOptionIndex]
					: question.options.filter((o) => o.isCorrect).map((o) => o.id),
		);

		const sortedStats = Object.entries(stats).sort(
			(a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)
		);
		const values = sortedStats.map(([, count]) => parseInt(count, 10) || 0);
		const maxCount = Math.max(...values, 1);

		return (
			<div className="flex flex-col min-h-dvh bg-transparent p-4 sm:p-6 md:p-8">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-(--app-surface-muted) rounded-lg border border-(--app-border)">
							<BarChart2 className="text-indigo-400" size={24} />
						</div>
						<h2 className="text-2xl font-bold text-(--app-fg)">Results</h2>
					</div>
					<button
						type="button"
						onClick={onNext}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
						Next Question <ArrowRight size={18} />
					</button>
				</div>

				<div className="flex-1 min-h-[320px] flex items-end justify-center gap-3 sm:gap-4 md:gap-8 pb-10 sm:pb-12 px-0 sm:px-2 md:px-4 max-w-5xl mx-auto w-full">
					{sortedStats.map(([idxKey, countStr], index) => {
						const count = parseInt(countStr, 10) || 0;
						const isCorrect = correctSet.has(parseInt(idxKey, 10));
						const Icon = getIcon(index);
						const heightPercent = (count / maxCount) * 100;

						return (
							<div
								key={idxKey}
								className="flex flex-col items-center justify-end w-full max-w-[72px] sm:max-w-[96px] md:max-w-[120px] h-[min(45vh,420px)] group">
								<div
									className={`w-full relative transition-all duration-1000 ease-out rounded-t-sm ${getBarColor(
										index
									)} ${
										!isCorrect
											? "opacity-50"
											: "opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
									}`}
									style={{ height: `${heightPercent}%` }}
								/>

								<div className="w-full bg-(--app-surface-muted) rounded-b-lg p-3 flex justify-center items-center gap-2 border-t-4 border-(--app-border) shadow-sm z-10">
									<Icon
										className={`${getBarColor(index).replace(
											"bg-",
											"text-"
										)} w-8 h-8 fill-current bg-opacity-0`}
										strokeWidth={3}
									/>
									<span className="text-(--app-fg) font-bold text-xl">
										{count}
									</span>
									{isCorrect ? (
										<div className="h-6 flex items-center justify-center">
											<Check
												className="text-green-400 w-6 h-6"
												strokeWidth={4}
											/>
										</div>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	const rows = Object.entries(stats)
		.map(([k, v]) => ({
			key: k,
			count: parseInt(v, 10) || 0,
		}))
		.sort((a, b) => b.count - a.count);
	const maxCount = Math.max(...rows.map((r) => r.count), 1);

	const caseSensitive = meta?.caseSensitive === true;
	const allowRange = meta?.allowRange === true;
	const correctText = (meta?.correctText ?? "").trim();

	const correctNumber =
		typeof meta?.correctNumber === "number" && Number.isFinite(meta.correctNumber)
			? meta.correctNumber
			: null;

	const rangeProximity =
		typeof meta?.rangeProximity === "number" &&
		Number.isFinite(meta.rangeProximity)
			? meta.rangeProximity
			: null;

	const isCorrectShortKey = (statKey: string) => {
		const got = statKey.trim();
		if (!correctText.length) return false;
		return caseSensitive
			? got === correctText
			: got.toLowerCase() === correctText.toLowerCase();
	};

	const isCorrectNumberKey = (statKey: string) => {
		const n = parseFloat(statKey);
		if (!Number.isFinite(n)) return false;

		if (allowRange === true) {
			if (correctNumber == null || rangeProximity == null) return false;
			const min = correctNumber - rangeProximity;
			const max = correctNumber + rangeProximity;
			return n >= min && n <= max;
		}

		return correctNumber != null && n === correctNumber;
	};

	const rowsWithCorrect = rows.map((r) => ({
		...r,
		isCorrect:
			qType === "SHORT_ANSWER" ? isCorrectShortKey(r.key) : isCorrectNumberKey(r.key),
	}));

	let heroLabel = "";
	let heroValue = "";
	let heroBadge: string | null = null;
	if (qType === "SHORT_ANSWER") {
		heroLabel = "Correct answer";
		heroValue = (meta?.correctText ?? "—").trim() || "—";
	} else if (qType === "NUMBER_INPUT") {
		if (meta?.allowRange === true) {
			heroLabel = "Accepted range";
			if (
				typeof meta?.correctNumber === "number" &&
				Number.isFinite(meta.correctNumber) &&
				typeof meta?.rangeProximity === "number" &&
				Number.isFinite(meta.rangeProximity)
			) {
				const min = meta.correctNumber - meta.rangeProximity;
				const max = meta.correctNumber + meta.rangeProximity;
				heroValue = `${min} – ${max}`;
				heroBadge = "Inclusive";
			}
		} else {
			heroLabel = "Correct number";
			heroValue = `${meta?.correctNumber ?? "—"}`;
		}
	}

	const rowsToRender = (() => {
		return rowsWithCorrect;
	})();

	return (
		<div className="flex flex-col min-h-dvh bg-transparent p-4 sm:p-6 md:p-8">
			<div className="flex justify-between items-start gap-4 mb-6">
				<div className="flex items-center gap-3 min-w-0">
					<div className="p-2 bg-(--app-surface-muted) rounded-lg border border-(--app-border) shrink-0">
						<BarChart2 className="text-indigo-400" size={24} />
					</div>
					<div className="min-w-0">
						<h2 className="text-2xl font-bold text-(--app-fg)">Results</h2>
					</div>
				</div>
				<button
					type="button"
					onClick={onNext}
					className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
					Next Question <ArrowRight size={18} />
				</button>
			</div>

			<div className="max-w-4xl mx-auto w-full">
				<div className="rounded-3xl border border-(--app-border) bg-(--app-surface-muted)/60 px-6 py-10 text-center mb-8">
					{heroLabel ? (
						<p className="text-xs text-indigo-600 dark:text-indigo-300 uppercase tracking-widest font-semibold">
							{heroLabel}
						</p>
					) : null}
					<p className="text-(--app-fg) font-extrabold text-5xl md:text-6xl mt-3 leading-tight">
						{heroValue || "—"}
					</p>
					{heroBadge ? (
						<div className="mt-4 flex justify-center">
							<span className="inline-flex items-center rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs font-semibold text-(--app-fg-muted)">
								{heroBadge}
							</span>
						</div>
					) : null}
				</div>

				{showSubmittedAnswerCards ? (
					<div className="mt-2 max-w-4xl mx-auto w-full">
						{rowsToRender.length === 0 ? (
							<p className="text-(--app-fg-muted) text-sm">No answers recorded.</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{rowsToRender.map((r) => (
									<div
										key={r.key}
										className={`relative rounded-2xl border border-(--app-border) bg-(--app-surface-muted)/80 p-4 ${
											r.isCorrect
												? "ring-2 ring-inset ring-green-500/40 border-green-500/30"
												: ""
										}`}>
										{r.isCorrect ? (
											<div className="pointer-events-none absolute -top-3 -right-3 z-10 rounded-full bg-(--app-surface) p-1 border border-green-500/40 shadow-sm">
												<Check
													className="text-green-400 w-4 h-4"
													strokeWidth={4}
												/>
											</div>
										) : null}
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-xs uppercase tracking-widest text-(--app-fg-muted) font-semibold">
													Submitted
												</p>
												<div className="mt-1 text-sm font-mono text-(--app-fg) line-clamp-2">
													{r.key}
												</div>
											</div>
											<span className="text-2xl font-bold tabular-nums text-(--app-fg)">
												{r.count}
											</span>
										</div>
										<div className="mt-3 h-2 rounded-full bg-indigo-500/15">
											<div
												className="h-full rounded-full bg-indigo-500/60 transition-all"
												style={{
													width: `${Math.max(8, (r.count / maxCount) * 100)}%`,
												}}
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
};
