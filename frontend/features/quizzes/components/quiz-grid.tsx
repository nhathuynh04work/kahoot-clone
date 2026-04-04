"use client";

import { useQuery } from "@tanstack/react-query";
import { QuizCard } from "./quiz-card";
import { QuizWithQuestions } from "@/features/quizzes/types";
import { getMySavedQuizIds } from "@/features/quizzes/api/client-actions";

interface QuizGridProps {
	quizzes: QuizWithQuestions[];
	viewerId?: number;
	onSelectQuiz?: (quizId: number) => void;
}

export function QuizGrid({
	quizzes,
	viewerId,
	onSelectQuiz,
}: QuizGridProps) {
	useQuery({
		queryKey: ["mySavedQuizzes"],
		queryFn: getMySavedQuizIds,
	});

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{quizzes.map((quiz) => (
					<QuizCard
						key={quiz.id}
						quiz={quiz}
						viewerId={viewerId}
						onCardClick={() => {
							onSelectQuiz?.(quiz.id);
						}}
					/>
				))}
			</div>
		</>
	);
}
