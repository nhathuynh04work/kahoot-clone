import { useQuery } from "@tanstack/react-query";
import type { QuizFullDetails } from "../types";
import { getPublicQuiz, getQuiz } from "../api/server-actions";
import { quizQueryKeys } from "./use-quiz-search-infinite";

export function useFullQuiz(quizId: number, options?: { variant?: "default" | "public" }) {
	const variant = options?.variant ?? "default";
	const query = useQuery<QuizFullDetails>({
		queryKey: [...quizQueryKeys.details(quizId), variant],
		queryFn: () =>
			variant === "public" ? getPublicQuiz(String(quizId)) : getQuiz(String(quizId)),
	});

	return { fullQuiz: query.data ?? null, questionsLoading: query.isLoading };
}

