"use client";

import { useMemo, useState } from "react";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizGrid } from "@/features/quizzes/components/quiz-grid";
import { QuizDetailsDrawer } from "@/features/quizzes/components/quiz-details-drawer";

export function LibraryQuizzesClient({
	quizzes,
	viewerId,
}: {
	quizzes: QuizWithQuestions[];
	viewerId?: number;
}) {
	const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

	const selectedQuiz = useMemo(() => {
		if (selectedQuizId === null) return null;
		return quizzes.find((q) => q.id === selectedQuizId) ?? null;
	}, [quizzes, selectedQuizId]);

	return (
		<>
			<QuizGrid
				quizzes={quizzes}
				viewerId={viewerId}
				onSelectQuiz={(id) => setSelectedQuizId(id)}
			/>

			{selectedQuiz && (
				<QuizDetailsDrawer
					quiz={selectedQuiz}
					viewerId={viewerId}
					onClose={() => setSelectedQuizId(null)}
				/>
			)}
		</>
	);
}

