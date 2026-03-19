"use client";

import { useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsDrawer } from "@/features/quizzes/components/quiz-details-drawer";
import { ReportToolbar } from "./report-toolbar";
import { ReportPagination } from "./report-pagination";
import { ReportSessionList } from "./report-session-list";
import { useReportSearchParams } from "@/features/game/hooks/use-report-search-params";
import { useReportPageQuery } from "@/features/game/hooks/use-report-queries";
import { useQueryClient } from "@tanstack/react-query";
import { quizQueryKeys } from "@/features/quizzes/hooks/use-quiz-search-infinite";

export function ReportPageClient() {
	const { page, pageSize, sort, q, setParams } = useReportSearchParams();
	const queryClient = useQueryClient();

	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null,
	);
	const [quizLoadingId, setQuizLoadingId] = useState<number | null>(null);
	const [quizError, setQuizError] = useState<string | null>(null);

	const [debouncedQ] = useDebounce(q, 300);
	const reportQuery = useReportPageQuery({ page, pageSize, q: debouncedQ, sort });

	if (reportQuery.isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	const data = reportQuery.data;
	const items = data?.items ?? [];

	const Pagination = data ? (
		<ReportPagination
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
		<ReportToolbar
			sort={sort}
			q={q}
			onChangeSort={(next) => setParams({ sort: next, page: "1" })}
			onChangeQ={(nextQ) => setParams({ q: nextQ, page: "1" })}
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
						{q?.trim()
							? "Try clearing the search or changing sort."
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
				{reportQuery.isError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						Failed to load reports.
					</div>
				) : null}
				{quizError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{quizError}
					</div>
				) : null}
				<ReportSessionList
					items={items}
					quizTitleLoadingId={quizLoadingId}
					hrefForLobbyId={(lobbyId) => `/dashboard/report/${lobbyId}`}
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
				<QuizDetailsDrawer
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			) : null}
		</>
	);
}
