"use client";

import { useState } from "react";
import { QuizCard } from "./quiz-card";
import { QuizDetailsModal } from "./quiz-details-modal";
import { QuizWithQuestions } from "../types";

interface QuizGridClientProps {
	quizzes: QuizWithQuestions[];
}

export function QuizGridClient({ quizzes }: QuizGridClientProps) {
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
				<QuizDetailsModal
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			)}
		</>
	);
}
