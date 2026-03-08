"use client";

import { Plus, Check, PanelRight, CheckCircle, Circle, Pencil, Check as CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Same option colors as quiz editor option-card (Kahoot-style) */
const optionColors = [
	"bg-red-800",
	"bg-blue-800",
	"bg-yellow-800",
	"bg-green-800",
];

/** Mock generated question for Canvas UI only */
export interface MockGeneratedQuestion {
	id: string;
	text: string;
	options: { text: string; isCorrect: boolean }[];
}

interface GeneratedQuestionsCanvasProps {
	questions: MockGeneratedQuestion[];
	onAddToQuiz?: (question: MockGeneratedQuestion) => void;
	/** Called when user edits question text, option text, or correct answer */
	onUpdateQuestion?: (
		questionId: string,
		updates: Partial<Pick<MockGeneratedQuestion, "text">> & {
			option?: { index: number; text?: string; isCorrect?: boolean };
		}
	) => void;
	/** Mock: which question IDs have been "added" (for UI state) */
	addedIds?: Set<string>;
	onClose?: () => void;
	className?: string;
}

export function GeneratedQuestionsCanvas({
	questions,
	onAddToQuiz,
	onUpdateQuestion,
	addedIds = new Set(),
	onClose,
	className,
}: GeneratedQuestionsCanvasProps) {
	const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

	if (questions.length === 0) return null;

	return (
		<div
			className={cn(
				"flex flex-col bg-gray-900/95 border-l border-gray-700 overflow-hidden",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-700 shrink-0">
				<div className="flex items-center gap-2 min-w-0">
					<PanelRight className="w-5 h-5 text-indigo-400 shrink-0" />
					<h3 className="font-semibold text-white truncate">Generated questions</h3>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="px-2.5 py-1 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
						aria-label="Close panel"
					>
						Done
					</button>
				)}
			</div>
			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{questions.map((q) => {
					const added = addedIds.has(q.id);
					const isEditing = editingQuestionId === q.id;
					const editable = !added && isEditing;
					return (
						<div
							key={q.id}
							className="rounded-md border border-gray-700 bg-gray-800 overflow-hidden shadow-sm"
						>
							<div className="p-3 border-b border-gray-700 flex items-start justify-between gap-2">
								<div className="min-w-0 flex-1">
								{editable && onUpdateQuestion ? (
									<input
										type="text"
										value={q.text}
										onChange={(e) =>
											onUpdateQuestion(q.id, { text: e.target.value })
										}
										className="w-full text-sm font-medium text-gray-200 bg-gray-900 border border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
										placeholder="Question text"
									/>
								) : (
									<p className="text-sm font-medium text-gray-200 wrap-break-word">
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
												: "text-gray-400 hover:text-indigo-400 hover:bg-gray-700",
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
							<div className="p-2 flex flex-col gap-1.5">
								{q.options.map((opt, i) => (
									<div
										key={i}
										className={cn(
											"py-1.5 px-2 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-2 min-h-0",
										)}
									>
										<div
											className={cn(
												"w-5 h-5 rounded shrink-0",
												optionColors[i % optionColors.length],
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
												className="flex-1 min-w-0 text-xs text-white bg-transparent border border-gray-600 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
												placeholder={`Option ${i + 1}`}
											/>
										) : (
											<span className="text-xs text-white wrap-break-word flex-1 min-w-0">
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
												className="shrink-0 p-0.5 rounded hover:bg-gray-700 transition-colors"
												title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
											>
												{opt.isCorrect ? (
													<CheckCircle className="w-4 h-4 text-green-500" />
												) : (
													<Circle className="w-4 h-4 text-gray-600" />
												)}
											</button>
										) : (
											<>
												{opt.isCorrect ? (
													<CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
												) : (
													<Circle className="w-4 h-4 text-gray-600 shrink-0" />
												)}
											</>
										)}
									</div>
								))}
							</div>
							<div className="px-3 pb-3">
								<button
									type="button"
									onClick={() => !added && onAddToQuiz?.(q)}
									disabled={added}
									className={cn(
										"w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
										added
											? "bg-gray-700 text-green-400 cursor-default"
											: "bg-indigo-800 hover:bg-indigo-700 text-white",
									)}
								>
									{added ? (
										<>
											<Check className="w-4 h-4" />
											Added to quiz
										</>
									) : (
										<>
											<Plus className="w-4 h-4" />
											Add to quiz
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
