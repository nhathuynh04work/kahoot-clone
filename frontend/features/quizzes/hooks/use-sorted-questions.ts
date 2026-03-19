import { useCallback, useMemo } from "react";
import type {
	QuizFullDetails,
	QuizWithQuestions,
	QuestionWithOptions,
} from "@/features/quizzes/types";

export function useSortedQuestionsWithOptions({
	quiz,
	fullQuiz,
}: {
	quiz: QuizWithQuestions;
	fullQuiz: QuizFullDetails | null;
}) {
	const questions = useMemo(() => {
		const base = fullQuiz ? fullQuiz.questions : quiz.questions;
		return [...base].sort((a, b) => a.sortOrder - b.sortOrder);
	}, [fullQuiz, quiz.questions]);

	const getOptions = useCallback(
		(q: (typeof questions)[0]) =>
			fullQuiz && "options" in q ? (q as QuestionWithOptions).options : null,
		[fullQuiz],
	);

	return { questions, getOptions };
}
