"use client";

import { useEffect, useMemo, useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionWithOptions } from "@/features/quizzes/types";

export function MobileQuestionBar({
	questions,
	activeQuestionId,
	onSelectQuestion,
	onAddQuestion,
	hidden,
	className,
}: {
	questions: QuestionWithOptions[];
	activeQuestionId: number;
	onSelectQuestion: (id: number) => void;
	onAddQuestion: () => void;
	hidden?: boolean;
	className?: string;
}) {
	const activeIndex = useMemo(
		() => questions.findIndex((q) => q.id === activeQuestionId),
		[questions, activeQuestionId]
	);

	const chipRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());

	useEffect(() => {
		const el = chipRefs.current.get(activeQuestionId);
		el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
	}, [activeQuestionId]);

	if (hidden) return null;

	return (
		<div
			className={cn(
				"fixed left-0 right-0 bottom-0 z-50 border-t border-gray-700 bg-gray-900",
				"pb-[env(safe-area-inset-bottom)]",
				className
			)}
			role="navigation"
			aria-label="Question navigation"
		>
			<div className="relative h-16">
				<div
					className="h-full overflow-x-auto pr-16"
					aria-label="Question list"
				>
					<div className="h-full flex items-center gap-2 px-3">
						{questions.map((q, i) => {
							const isActive = q.id === activeQuestionId;
							const label = String(i + 1);
							return (
								<button
									key={q.id ?? `q-${i}`}
									ref={(el) => {
										chipRefs.current.set(q.id, el);
									}}
									type="button"
									onClick={() => onSelectQuestion(q.id)}
									className={cn(
										"shrink-0 h-10 min-w-10 px-3 rounded-full border text-sm font-semibold tabular-nums transition-colors",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
										isActive
											? "bg-indigo-600 border-indigo-500 text-white"
											: "bg-gray-900/30 border-gray-700 text-gray-200 hover:bg-gray-800/60"
									)}
									aria-current={isActive ? "page" : undefined}
									aria-label={`Question ${label}${
										activeIndex === i ? ", active" : ""
									}`}
								>
									{label}
								</button>
							);
						})}
					</div>
				</div>

				<div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-gray-900 border-l border-gray-800"
						aria-hidden
					/>
					<button
						type="button"
						onClick={onAddQuestion}
						className={cn(
							"relative inline-flex items-center justify-center h-11 w-11 rounded-lg",
							"bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/25 transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
						)}
						aria-label="Add question"
					>
						<Plus className="w-5 h-5" aria-hidden />
					</button>
				</div>
			</div>
		</div>
	);
}

