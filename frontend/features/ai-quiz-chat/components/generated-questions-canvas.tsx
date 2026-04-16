"use client";

import { Plus, Check, PanelRight, CheckCircle, Circle, Pencil, Check as CheckIcon } from "lucide-react";
import { useState } from "react";
import type { MockGeneratedQuestion } from "../types";
import { cn } from "@/lib/utils";

const OPTION_COLORS = [
	"bg-red-500 dark:bg-red-800",
	"bg-blue-500 dark:bg-blue-800",
	"bg-amber-400 dark:bg-yellow-700",
	"bg-green-500 dark:bg-green-800",
];

export type { MockGeneratedQuestion };

interface GeneratedQuestionsCanvasProps {
	questions: MockGeneratedQuestion[];
	onAddToQuiz?: (question: MockGeneratedQuestion) => void;
	onUpdateQuestion?: (
		questionId: string,
		updates: Partial<Pick<MockGeneratedQuestion, "text">> & {
			option?: { index: number; text?: string; isCorrect?: boolean };
		},
	) => void;
	addedIds?: Set<string>;
	onClose?: () => void;
	className?: string;
}

export function GeneratedQuestionsCanvas({
	questions,
	onAddToQuiz,
	onUpdateQuestion,
	addedIds = new Set<string>(),
	onClose,
	className,
}: GeneratedQuestionsCanvasProps) {
	const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

	if (questions.length === 0) return null;

	return (
		<div
			className={cn(
				"flex flex-col bg-(--app-surface) border-l border-(--app-border) overflow-hidden text-(--app-fg)",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-(--app-border) shrink-0">
				<div className="flex items-center gap-2 min-w-0">
					<PanelRight className="w-5 h-5 text-indigo-400 shrink-0" />
					<h3 className="font-semibold text-(--app-fg) truncate">Generated questions</h3>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="px-2.5 py-1 rounded-lg text-sm font-medium text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors shrink-0"
						aria-label="Close panel"
					>
						Done
					</button>
				)}
			</div>
			<div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
				{questions.map((q) => {
					const added = addedIds.has(q.id);
					const isEditing = editingQuestionId === q.id;
					const editable = !added && isEditing;
					return (
						<div
							key={q.id}
							className="rounded-md border border-(--app-border) bg-(--app-surface-muted) overflow-hidden shadow-sm"
						>
							<div className="p-2.5 sm:p-3 border-b border-(--app-border) flex items-start justify-between gap-2">
								<div className="min-w-0 flex-1 space-y-1">
									<p className="text-[10px] uppercase tracking-wide text-(--app-fg-muted)/80 font-semibold">
										{q.type.replace(/_/g, " ")}
									</p>
									{editable && onUpdateQuestion ? (
										<input
											type="text"
											value={q.text}
											onChange={(e) =>
												onUpdateQuestion(q.id, { text: e.target.value })
											}
											className="w-full text-sm font-medium text-(--app-fg) bg-(--app-input-bg) border border-(--app-border) rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
											placeholder="Question text"
										/>
									) : (
										<p className="text-sm font-medium text-(--app-fg) wrap-break-word">
											{q.text}
										</p>
									)}
								</div>
								{!added && (
									<button
										type="button"
										onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
										className={cn(
											"shrink-0 p-1.5 rounded transition-colors",
											isEditing
												? "bg-indigo-600 text-white"
												: "text-(--app-fg-muted) hover:text-indigo-400 hover:bg-(--app-surface)",
										)}
										title={isEditing ? "Done" : "Edit"}
										aria-label={isEditing ? "Done editing" : "Edit question"}
									>
										{isEditing ? (
											<CheckIcon className="w-4 h-4" />
										) : (
											<Pencil className="w-4 h-4" />
										)}
									</button>
								)}
							</div>

							{q.type === "TRUE_FALSE" ? (
								<div className="p-3 text-xs text-(--app-fg-muted) border-t border-(--app-border)/60">
									<span className="text-(--app-fg-muted)/80">Correct: </span>
									<span className="text-emerald-400 font-medium">
										{q.correctIsTrue ? "True" : "False"}
									</span>
								</div>
							) : null}

							{q.type === "MULTIPLE_CHOICE" ? (
								<div className="p-2 flex flex-col gap-1.5">
									{q.options.map((opt, i) => (
										<div
											key={i}
											className="py-1.5 px-2 rounded-md border border-(--app-border) bg-(--app-input-bg) flex items-center gap-2 min-h-0"
										>
											<div
												className={cn(
													"w-5 h-5 rounded shrink-0",
													OPTION_COLORS[i % OPTION_COLORS.length],
												)}
											/>
											{editable && onUpdateQuestion ? (
												<input
													type="text"
													value={opt.text}
													onChange={(e) =>
														onUpdateQuestion(q.id, {
															option: { index: i, text: e.target.value },
														})
													}
													className="flex-1 min-w-0 text-xs text-(--app-fg) bg-transparent border border-(--app-border) rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
													placeholder={`Option ${i + 1}`}
												/>
											) : (
												<span className="text-xs text-(--app-fg) wrap-break-word flex-1 min-w-0">
													{opt.text}
												</span>
											)}
											{editable && onUpdateQuestion ? (
												<button
													type="button"
													onClick={() =>
														onUpdateQuestion(q.id, {
															option: { index: i, isCorrect: !opt.isCorrect },
														})
													}
													className="shrink-0 p-0.5 rounded hover:bg-(--app-surface-muted) transition-colors"
													title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
												>
													{opt.isCorrect ? (
														<CheckCircle className="w-4 h-4 text-green-500" />
													) : (
														<Circle className="w-4 h-4 text-(--app-fg-muted)" />
													)}
												</button>
											) : (
												<>
													{opt.isCorrect ? (
														<CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
													) : (
														<Circle className="w-4 h-4 text-(--app-fg-muted) shrink-0" />
													)}
												</>
											)}
										</div>
									))}
								</div>
							) : null}

							{q.type === "SHORT_ANSWER" ? (
								<div className="p-3 text-xs text-(--app-fg-muted) border-t border-(--app-border)/60">
									<span className="text-(--app-fg-muted)/80">Correct: </span>
									<span className="text-emerald-400 font-medium">{q.correctText}</span>
								</div>
							) : null}

							{q.type === "NUMBER_INPUT" ? (
								<div className="p-3 text-xs text-(--app-fg-muted) border-t border-(--app-border)/60">
									Correct: {q.correctNumber} (± {q.rangeProximity})
								</div>
							) : null}

							<div className="px-3 pb-3">
								<button
									type="button"
									onClick={() => !added && onAddToQuiz?.(q)}
									disabled={added}
									className={cn(
										"w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
										added
											? "bg-(--app-surface-muted) text-emerald-600 dark:text-emerald-400 cursor-default border border-(--app-border)"
											: "bg-indigo-600 hover:bg-indigo-500 text-white",
									)}
								>
									{added ? (
										<>
											<Check className="w-4 h-4" /> Added to quiz
										</>
									) : (
										<>
											<Plus className="w-4 h-4" /> Add to quiz
										</>
									)}
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
