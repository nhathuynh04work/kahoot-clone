import { useInfiniteQuery } from "@tanstack/react-query";
import {
	searchQuizzes,
	type QuizPageResponse,
} from "@/features/quizzes/api/server-actions";

export const quizQueryKeys = {
	all: ["quizzes"] as const,
	search: (args: { q?: string; pageSize: number }) =>
		[...quizQueryKeys.all, "search", args] as const,
	details: (id: number) => [...quizQueryKeys.all, "details", id] as const,
};

export function useQuizSearchInfiniteQuery(args: {
	q?: string;
	pageSize: number;
	enabled?: boolean;
}) {
	return useInfiniteQuery<QuizPageResponse>({
		queryKey: quizQueryKeys.search({ q: args.q, pageSize: args.pageSize }),
		enabled: args.enabled,
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			searchQuizzes({
				q: args.q?.trim() ? args.q.trim() : undefined,
				page: Number(pageParam) || 1,
				pageSize: args.pageSize,
			}),
		getNextPageParam: (lastPage) =>
			lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
	});
}

