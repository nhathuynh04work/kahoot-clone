"use client";

import { useMemo, useState } from "react";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizCard } from "@/features/quizzes/components/quiz-card";
import { QuizDetailsDrawer } from "@/features/quizzes/components/quiz-details-drawer";

export function ExploreQuizGrid({
	quizzes,
	viewerId,
}: {
	quizzes: Array<QuizWithQuestions & { saveCount?: number; playCount?: number }>;
	viewerId?: number;
}) {
	const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

	const selectedQuiz = useMemo(() => {
		if (selectedQuizId === null) return null;
		return quizzes.find((q) => q.id === selectedQuizId) ?? null;
	}, [quizzes, selectedQuizId]);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{quizzes.map((quiz) => (
					<QuizCard
						key={quiz.id}
						quiz={quiz}
						viewerId={viewerId}
						onCardClick={() => setSelectedQuizId(quiz.id)}
					/>
				))}
			</div>

			{selectedQuiz && (
				<QuizDetailsDrawer
					quiz={selectedQuiz}
					viewerId={viewerId}
					variant="public"
					onClose={() => setSelectedQuizId(null)}
				/>
			)}
		</>
	);
}

