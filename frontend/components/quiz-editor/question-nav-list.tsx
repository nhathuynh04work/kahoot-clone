"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import QuestionNavItem from "./question-nav-item";
import { useMutation } from "@tanstack/react-query";
import { addQuestion } from "@/app/actions/quiz";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface QuestionNavListProps {
	questions: QuestionWithOptions[];
	quizId: number;
}

export default function QuestionNavList({
	questions,
	quizId,
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
		<div className="col-span-2 flex flex-col overflow-y-auto border-r border-gray-700">
			{questions.map((q) => (
				<QuestionNavItem key={q.id} question={q} />
			))}

			<div className="w-full p-4">
				<button
					onClick={() => mutate()}
					disabled={isPending}
					className="flex items-center justify-center gap-2 w-full font-semibold text-white bg-indigo-800 hover:bg-indigo-900 disabled:bg-indigo-800 disabled:opacity-75 transition-colors py-4 rounded-md">
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
