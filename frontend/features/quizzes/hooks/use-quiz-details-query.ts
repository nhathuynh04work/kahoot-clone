import { useQuery } from "@tanstack/react-query";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizFullDetails } from "@/features/quizzes/types";
import { quizQueryKeys } from "./use-quiz-search-infinite";

export function useQuizDetailsQuery(quizId: number | null, enabled = true) {
	return useQuery<QuizFullDetails>({
		queryKey: quizId ? quizQueryKeys.details(quizId) : ["quizzes", "details", 0],
		queryFn: () => {
			if (!quizId) throw new Error("quizId is required");
			return getQuiz(String(quizId));
		},
		enabled: enabled && quizId !== null,
	});
}

