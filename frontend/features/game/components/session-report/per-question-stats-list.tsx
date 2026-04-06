"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { SessionReport } from "@/features/game/api/server-actions";
import { cn } from "@/lib/utils";
import { optionColors } from "@/lib/option-colors";

export interface PerQuestionStatsListProps {
	report: SessionReport;
	limit?: number;
}

export function PerQuestionStatsList({
	report,
	limit,
}: PerQuestionStatsListProps) {
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

			const qType = q.question?.type ?? "MULTIPLE_CHOICE";
			const summary = q.answerSummary;
			let freeTextRows: { label: string; count: number }[] = [];
			if (qType === "SHORT_ANSWER" && summary && summary.kind === "short_answer") {
				const counts = summary.counts as Record<string, number> | undefined;
				if (counts) {
					freeTextRows = Object.entries(counts)
						.map(([label, count]) => ({ label, count }))
						.sort((a, b) => b.count - a.count);
				}
			} else if (
				qType === "NUMBER_INPUT" &&
				summary &&
				summary.kind === "number_input"
			) {
				const values = summary.values as number[] | undefined;
				if (values?.length) {
					const m = new Map<string, number>();
					for (const v of values) {
						const k = String(v);
						m.set(k, (m.get(k) ?? 0) + 1);
					}
					freeTextRows = [...m.entries()]
						.map(([label, count]) => ({ label, count }))
						.sort((a, b) => b.count - a.count);
				}
			}

			return {
				key: `${q.questionId}-${q.sortIndex}-${idx}`,
				label: `Q${idx + 1}`,
				text: q.question?.text?.trim() || "—",
				imageUrl: q.question?.imageUrl ?? null,
				correct: q.correctCount,
				incorrect: q.incorrectCount,
				accuracy,
				optionRows,
				qType,
				freeTextRows,
			};
		});
	}, [report.questions, limit]);

	const [expandedKey, setExpandedKey] = useState<string | null>(null);

	return (
		<div>
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-gray-400">
					{rows.length} question{rows.length === 1 ? "" : "s"}
				</p>
			</div>

			<div className="mt-3 space-y-4">
				{rows.map((r) => {
					const isOpen = expandedKey === r.key;

					return (
						<div
							key={r.key}
							className="grid grid-cols-[56px_1fr] items-stretch border border-gray-700/60 rounded-md overflow-hidden bg-gray-900/10"
						>
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
												{(r.qType === "SHORT_ANSWER" ||
													r.qType === "NUMBER_INPUT") &&
												r.freeTextRows.length > 0 ? (
													r.freeTextRows.map((row) => (
														<div
															key={row.label}
															className="flex items-center justify-between gap-3 px-3 py-2">
															<p className="text-sm text-white truncate font-mono">
																{row.label}
															</p>
															<span className="text-sm font-semibold text-indigo-300 tabular-nums">
																{row.count}
															</span>
														</div>
													))
												) : r.optionRows.length > 0 ? (
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
														{r.qType === "MULTIPLE_CHOICE" ||
														r.qType === "TRUE_FALSE"
															? "No options for this question."
															: "No answer breakdown for this question."}
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
