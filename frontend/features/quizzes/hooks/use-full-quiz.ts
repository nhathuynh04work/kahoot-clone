import { useQuery } from "@tanstack/react-query";
import type { QuizFullDetails } from "../types";
import { getQuiz } from "../api/server-actions";
import { quizQueryKeys } from "./use-quiz-search-infinite";

export function useFullQuiz(quizId: number) {
	const query = useQuery<QuizFullDetails>({
		queryKey: quizQueryKeys.details(quizId),
		queryFn: () => getQuiz(String(quizId)),
	});

	return { fullQuiz: query.data ?? null, questionsLoading: query.isLoading };
}

