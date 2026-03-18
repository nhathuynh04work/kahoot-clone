"use client";

import { useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsModal } from "@/features/quizzes/components/quiz-details-modal";
import { HistoryToolbar } from "./history/history-toolbar";
import { HistoryPagination } from "./history/history-pagination";
import { HistorySessionList } from "./history/history-session-list";
import { useHistorySearchParams } from "../hooks/use-history-search-params";
import { useHistoryPageQuery } from "../hooks/use-history-queries";
import { useQueryClient } from "@tanstack/react-query";
import { quizQueryKeys } from "@/features/quizzes/hooks/use-quiz-search-infinite";

export function HistoryPageClient() {
	const { page, pageSize, sort, quizId, setParams } = useHistorySearchParams();
	const queryClient = useQueryClient();

	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null,
	);
	const [quizLoadingId, setQuizLoadingId] = useState<number | null>(null);
	const [quizError, setQuizError] = useState<string | null>(null);

	const historyQuery = useHistoryPageQuery({ page, pageSize, quizId, sort });

	if (historyQuery.isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	const data = historyQuery.data;
	const items = data?.items ?? [];

	const Pagination = data ? (
		<HistoryPagination
			page={data.page}
			totalPages={data.totalPages}
			totalItems={data.totalItems}
			onPrev={() => setParams({ page: String(Math.max(1, data.page - 1)) })}
			onNext={() =>
				setParams({ page: String(Math.min(data.totalPages, data.page + 1)) })
			}
		/>
	) : null;

	const Toolbar = (
		<HistoryToolbar
			sort={sort}
			quizId={quizId}
			onChangeSort={(next) => setParams({ sort: next, page: "1" })}
			onChangeQuizId={(nextQuizId) =>
				setParams({
					quizId: nextQuizId ? String(nextQuizId) : undefined,
					page: "1",
				})
			}
		/>
	);

	if (!data || items.length === 0) {
		return (
			<>
				{Toolbar}
				<div className="text-center bg-gray-800/50 p-10 rounded-lg border border-gray-700">
					<div className="mx-auto w-12 h-12 rounded-xl bg-gray-700/60 border border-gray-700 flex items-center justify-center">
						<Clock3 className="w-6 h-6 text-indigo-300" />
					</div>
					<h3 className="mt-4 text-xl font-semibold text-white">
						No sessions found
					</h3>
					<p className="text-gray-400 mt-2">
						{quizId
							? "Try clearing the quiz filter or changing sort."
							: "Complete a quiz game to see your session snapshots and reports here."}
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			{Toolbar}

			<div className="space-y-4">
				{historyQuery.isError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						Failed to load history.
					</div>
				) : null}
				{quizError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{quizError}
					</div>
				) : null}
				<HistorySessionList
					items={items}
					quizTitleLoadingId={quizLoadingId}
					hrefForLobbyId={(lobbyId) => `/dashboard/history/${lobbyId}`}
					onOpenQuizDetails={(nextQuizId) => {
						if (quizLoadingId !== null) return;
						setQuizError(null);
						setQuizLoadingId(nextQuizId);
						queryClient
							.fetchQuery({
								queryKey: quizQueryKeys.details(nextQuizId),
								queryFn: () => getQuiz(String(nextQuizId)),
							})
							.then((q) => setSelectedQuiz(q as unknown as QuizWithQuestions))
							.catch((e) =>
								setQuizError(
									e instanceof Error ? e.message : "Failed to load quiz details.",
								),
							)
							.finally(() => setQuizLoadingId(null));
					}}
				/>
			</div>

			{Pagination}

			{selectedQuiz ? (
				<QuizDetailsModal
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			) : null}
		</>
	);
}
