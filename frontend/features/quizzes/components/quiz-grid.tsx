"use client";

import { useState } from "react";
import { QuizCard } from "./quiz-card";
import { QuizDetailsDrawer } from "./quiz-details-drawer";
import { QuizWithQuestions } from "@/features/quizzes/types";

interface QuizGridProps {
	quizzes: QuizWithQuestions[];
}

export function QuizGrid({ quizzes }: QuizGridProps) {
	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null
	);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{quizzes.map((quiz) => (
					<QuizCard
						key={quiz.id}
						quiz={quiz}
						onCardClick={() => setSelectedQuiz(quiz)}
					/>
				))}
			</div>

			{selectedQuiz && (
				<QuizDetailsDrawer
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			)}
		</>
	);
}
