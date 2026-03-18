"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SessionReport } from "@/features/game/api/server-actions";
import { cn } from "@/lib/utils";
import { optionColors } from "@/features/quizzes/components/quiz-editor/option-colors";

export function SessionStatTiles({ report }: { report: SessionReport }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<StatTile label="Players" value={report.aggregates.totalPlayers} />
			<StatTile label="Questions" value={report.aggregates.totalQuestions} />
			<StatTile
				label="Avg accuracy"
				value={`${(report.aggregates.avgAccuracy * 100).toFixed(1)}%`}
				tone="accent"
			/>
			<StatTile
				label="Answers"
				value={`${report.aggregates.totalCorrect}/${report.aggregates.totalAnswers}`}
			/>
		</div>
	);
}

export function PerQuestionAccuracyChart({
	report,
	limit = 10,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const data = useMemo(() => {
		const sorted = [...report.questions].sort((a, b) => a.sortIndex - b.sortIndex);
		return sorted.slice(0, limit).map((q, idx) => ({
			name: `Q${idx + 1}`,
			value: Math.round((q.correctRate ?? 0) * 100),
		}));
	}, [report.questions, limit]);

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Per-question accuracy</p>
				<p className="text-xs text-gray-400">First {data.length} questions</p>
			</div>
			<div className="mt-3 h-44">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} margin={{ left: 8, right: 8 }}>
						<XAxis
							dataKey="name"
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							axisLine={{ stroke: "rgba(55, 65, 81, 0.8)" }}
							tickLine={false}
						/>
						<YAxis
							domain={[0, 100]}
							tick={{ fill: "#9ca3af", fontSize: 12 }}
							axisLine={{ stroke: "rgba(55, 65, 81, 0.8)" }}
							tickLine={false}
							width={32}
							tickFormatter={(v) => `${v}%`}
						/>
						<Tooltip
							cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
							contentStyle={{
								background: "rgba(17, 24, 39, 0.95)",
								border: "1px solid rgba(55, 65, 81, 0.9)",
								color: "#fff",
								borderRadius: 10,
							}}
							labelStyle={{ color: "#e5e7eb" }}
							formatter={(v) => [`${v}%`, "Accuracy"]}
						/>
						<Bar dataKey="value" fill="#6366f1" radius={[8, 8, 2, 2]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

export function PerQuestionStatsList({
	report,
	limit,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const rows = useMemo(() => {
		const sorted = [...report.questions].sort((a, b) => a.sortIndex - b.sortIndex);
		const sliced = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

		return sliced.map((q, idx) => {
			const total = q.correctCount + q.incorrectCount;
			const accuracy =
				Number.isFinite(q.correctRate)
					? Math.round((q.correctRate ?? 0) * 100)
					: total > 0
						? Math.round((q.correctCount / total) * 100)
						: 0;

			const options = (q.question?.options ?? []).sort(
				(a, b) => a.sortOrder - b.sortOrder,
			);
			const optionRows = options.map((opt) => {
				const chosen = q.optionCounts[opt.id.toString()] ?? 0;
				return { ...opt, chosen };
			});

			return {
				key: `${q.questionId}-${q.sortIndex}-${idx}`,
				label: `Q${idx + 1}`,
				text: q.question?.text?.trim() || "—",
				imageUrl: q.question?.imageUrl ?? null,
				correct: q.correctCount,
				incorrect: q.incorrectCount,
				accuracy,
				optionRows,
			};
		});
	}, [report.questions, limit]);

	const [expandedKey, setExpandedKey] = useState<string | null>(null);

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Per-question stats</p>
				<p className="text-xs text-gray-400">
					{rows.length} question{rows.length === 1 ? "" : "s"}
				</p>
			</div>

			<div className="mt-3 space-y-2">
				{rows.map((r) => {
					const isOpen = expandedKey === r.key;

					return (
						<div
							key={r.key}
							className="grid grid-cols-[56px_1fr] items-stretch border border-gray-700/60 rounded-md overflow-hidden bg-gray-900/10"
						>
							{/* Fixed-size image (collapsed height stays constant while expanding options) */}
							<div className="relative w-14 min-h-11 bg-gray-950/20 overflow-hidden rounded-none shrink-0">
								{r.imageUrl ? (
									<Image
										src={r.imageUrl}
										alt="Question visual"
										fill
										sizes="56px"
										className="object-cover"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-gray-500">
										<ImageIcon className="w-5 h-5 opacity-70" />
									</div>
								)}
							</div>

							<button
								type="button"
								className={cn(
									"w-full px-3 py-2 flex items-start justify-between gap-3 rounded-none bg-transparent",
									"text-left transition-colors",
									isOpen ? "" : "hover:bg-gray-900/20",
								)}
								aria-expanded={isOpen}
								onClick={() =>
									setExpandedKey((k) => (k === r.key ? null : r.key))
								}
							>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-xs text-gray-400">{r.label}</p>
										<p className="text-xs font-semibold text-indigo-300 tabular-nums">
											{r.accuracy}%
										</p>
									</div>
									<p className="mt-0.5 text-sm text-white truncate">{r.text}</p>
								</div>

								<div className="shrink-0 text-right tabular-nums">
									<p className="text-xs text-gray-400">
										{r.correct}✓ / {r.incorrect}✕
									</p>
									<div className="mt-1 flex justify-end">
										{isOpen ? (
											<ChevronDown className="w-4 h-4 text-gray-400" />
										) : (
											<ChevronRight className="w-4 h-4 text-gray-400" />
										)}
									</div>
								</div>
							</button>

							{/* Animated expand/collapse: spans full width so options start at the left edge */}
							<div className="col-span-2">
								<div
									className={cn(
										"grid transition-all duration-200 ease-out",
										isOpen
											? "grid-rows-[1fr] opacity-100"
											: "grid-rows-[0fr] opacity-0",
										!isOpen && "pointer-events-none",
									)}
								>
									<div className="overflow-hidden">
										<div>
											<div className="divide-y divide-gray-700/60 border-t border-gray-700/60">
												{r.optionRows.length > 0 ? (
													r.optionRows.map((opt, optIdx) => {
														const chosenLabel =
															opt.chosen === 1
																? "1 answer"
																: `${opt.chosen} answers`;

														const isCorrect = opt.isCorrect;
														const colorClass =
															optionColors[optIdx % optionColors.length];

														return (
															<div
																key={opt.id}
																className={cn(
																	"flex items-center justify-between gap-3 px-3 py-2",
																	isCorrect && "bg-emerald-500/10",
																)}
															>
																<div className="flex items-center gap-3 min-w-0">
																	<div
																		className={cn(
																			"relative w-9 h-9 rounded-md shrink-0",
																			colorClass,
																		)}
																	>
																		{isCorrect ? (
																			<CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-white" />
																		) : null}
																	</div>
																	<p className="text-sm text-white truncate">
																		{opt.text?.trim() || "(No text)"}
																	</p>
																</div>

																<div className="shrink-0 text-right">
																	<div
																		className={cn(
																			"text-sm font-semibold tabular-nums",
																			isCorrect
																				? "text-emerald-300"
																				: "text-indigo-300",
																		)}
																	>
																		{opt.chosen}
																	</div>
																	<p className="text-[11px] text-gray-400">
																		{chosenLabel}
																	</p>
																</div>
															</div>
														);
													})
												) : (
													<p className="text-sm text-gray-400">
														No options for this question.
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function LeaderboardList({
	report,
	limit = 10,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const entries = report.leaderboard.slice(0, limit);
	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Leaderboard</p>
				<p className="text-xs text-gray-400">Top {entries.length}</p>
			</div>
			<div className="mt-3 space-y-1">
				{entries.map((entry, i) => (
					<div
						key={`${entry.nickname}-${i}`}
						className="flex justify-between items-center py-2 px-3 rounded-md bg-gray-900/40 border border-gray-700/60"
					>
						<span className="text-white text-sm">
							{i + 1}. {entry.nickname}
						</span>
						<span className="text-indigo-300 text-sm font-semibold tabular-nums">
							{entry.points} pts
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function StatTile({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: React.ReactNode;
	tone?: "default" | "accent";
}) {
	return (
		<div
			className={cn(
				"rounded-lg border p-3",
				"bg-gray-900/40 border-gray-700",
				tone === "accent" && "border-indigo-500/40",
			)}
		>
			<p className="text-gray-400 text-xs">{label}</p>
			<p
				className={cn(
					"mt-1 font-semibold text-white tabular-nums",
					tone === "accent" && "text-indigo-300",
				)}
			>
				{value}
			</p>
		</div>
	);
}

