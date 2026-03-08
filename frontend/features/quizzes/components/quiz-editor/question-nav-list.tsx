"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";
import QuestionNavItem from "./question-nav-item";
import { Plus } from "lucide-react";

interface QuestionNavListProps {
	questions: QuestionWithOptions[];
	activeQuestionId: number;
	onQuestionSelect: (id: number) => void;
	onAddQuestion: () => void;
}

export default function QuestionNavList({
	questions,
	activeQuestionId,
	onQuestionSelect,
	onAddQuestion,
}: QuestionNavListProps) {
	return (
		<div className="flex-1 flex flex-col h-full">
			<div className="grow overflow-y-auto py-2 space-y-1">
				{questions.map((q, i) => (
					<div
						key={q.id || `temp-${i}`}
						onClick={() => onQuestionSelect(q.id)}
						className="px-2">
						<QuestionNavItem
							question={q}
							index={i}
							isActive={q.id === activeQuestionId}
						/>
					</div>
				))}
			</div>

			<div className="shrink-0 w-full p-3">
				<button
					onClick={onAddQuestion}
					className="flex items-center justify-center gap-2 w-full font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-lg cursor-pointer text-sm">
					<Plus className="w-5 h-5" />
					<span>Add question</span>
				</button>
			</div>
		</div>
	);
}
