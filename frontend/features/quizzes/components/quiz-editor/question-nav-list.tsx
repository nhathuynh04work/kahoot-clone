"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import QuestionNavItem from "./question-nav-item";
import { useMutation } from "@tanstack/react-query";
import { addQuestion } from "@/actions/quiz";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface QuestionNavListProps {
	questions: QuestionWithOptions[];
	quizId: number;
	activeQuestionId: number;
	onQuestionSelect: (id: number) => void;
}

export default function QuestionNavList({
	questions,
	quizId,
	activeQuestionId,
	onQuestionSelect,
}: QuestionNavListProps) {
	const router = useRouter();

	const { mutate, isPending } = useMutation({
		mutationFn: () => addQuestion(quizId),

		onSuccess: () => {
			router.refresh();
		},
		onError: (error) => {
			console.error("Failed to add question:", error);
		},
	});

	return (
		<div className="flex-1 flex flex-col h-full">
			<div className="grow overflow-y-auto">
				{questions.map((q, i) => (
					<div key={q.id} onClick={() => onQuestionSelect(q.id)}>
						<QuestionNavItem
							question={q}
							index={i}
							isActive={q.id === activeQuestionId}
						/>
					</div>
				))}
			</div>

			<div className="shrink-0 w-full p-4">
				<button
					onClick={() => mutate()}
					disabled={isPending}
					className="flex items-center justify-center gap-2 w-full font-semibold text-white bg-indigo-800 hover:bg-indigo-900 disabled:bg-indigo-800 disabled:opacity-75 transition-colors py-4 rounded-md cursor-pointer">
					{isPending ? (
						"Adding..."
					) : (
						<>
							<Plus className="w-5 h-5" />
							<span>Add</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
}
