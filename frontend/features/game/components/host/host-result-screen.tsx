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

	if (qType === "MULTIPLE_CHOICE") {
		const correctId =
			meta?.correctOptionId ??
			question.options.find((o) => o.isCorrect)?.id ??
			0;

		const sortedStats = Object.entries(stats).sort(
			(a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)
		);
		const values = sortedStats.map(([, count]) => parseInt(count, 10) || 0);
		const maxCount = Math.max(...values, 1);

		return (
			<div className="flex flex-col min-h-screen bg-gray-900 p-8">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
							<BarChart2 className="text-indigo-400" size={24} />
						</div>
						<h2 className="text-2xl font-bold text-white">Results</h2>
					</div>
					<button
						type="button"
						onClick={onNext}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
						Next Question <ArrowRight size={18} />
					</button>
				</div>

				<div className="flex-1 min-h-[400px] flex items-end justify-center gap-4 md:gap-8 pb-12 px-4 max-w-5xl mx-auto w-full">
					{sortedStats.map(([optionId, countStr], index) => {
						const count = parseInt(countStr, 10) || 0;
						const isCorrect = parseInt(optionId, 10) === correctId;
						const Icon = getIcon(index);
						const heightPercent = (count / maxCount) * 100;

						return (
							<div
								key={optionId}
								className="flex flex-col items-center justify-end w-full max-w-[120px] h-[60vh] group">
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

								<div className="w-full bg-gray-800 rounded-b-lg p-3 flex justify-center items-center gap-2 border-t-4 border-gray-900 shadow-sm z-10">
									<Icon
										className={`${getBarColor(index).replace(
											"bg-",
											"text-"
										)} w-8 h-8 fill-current bg-opacity-0`}
										strokeWidth={3}
									/>
									<span className="text-white font-bold text-xl">
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

	let subtitle = "";
	if (qType === "SHORT_ANSWER") {
		subtitle = `Correct answer: "${meta?.correctText ?? "—"}"`;
	} else if (qType === "NUMERIC_RANGE") {
		const inc = meta?.rangeInclusive !== false;
		subtitle = `Correct range: ${meta?.rangeMin ?? "?"} – ${meta?.rangeMax ?? "?"}${inc ? " (inclusive)" : " (exclusive)"}`;
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 p-8">
			<div className="flex justify-between items-start gap-4 mb-6">
				<div className="flex items-center gap-3 min-w-0">
					<div className="p-2 bg-gray-800 rounded-lg border border-gray-700 shrink-0">
						<BarChart2 className="text-indigo-400" size={24} />
					</div>
					<div className="min-w-0">
						<h2 className="text-2xl font-bold text-white">Results</h2>
						<p className="text-sm text-gray-400 mt-1">{subtitle}</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onNext}
					className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
					Next Question <ArrowRight size={18} />
				</button>
			</div>

			<div className="max-w-2xl mx-auto w-full space-y-2">
				{rows.length === 0 ? (
					<p className="text-gray-500 text-sm">No answers recorded.</p>
				) : (
					rows.map((r, i) => (
						<div
							key={r.key}
							className="flex items-center gap-3 rounded-lg bg-gray-800/80 border border-gray-700 p-3">
							<div
								className="h-2 rounded-full bg-indigo-500 transition-all"
								style={{
									width: `${Math.max(8, (r.count / maxCount) * 100)}%`,
									minWidth: "2rem",
								}}
							/>
							<span className="flex-1 text-sm text-white truncate font-mono">
								{r.key}
							</span>
							<span className="text-sm font-semibold text-indigo-300 tabular-nums">
								{r.count}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
};
