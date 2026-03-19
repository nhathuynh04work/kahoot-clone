"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsDrawer } from "@/features/quizzes/components/quiz-details-drawer";
import { quizQueryKeys } from "@/features/quizzes/hooks/use-quiz-search-infinite";
import { useReportPageQuery } from "@/features/game/hooks/use-report-queries";
import { useReportSearchParams } from "@/features/game/hooks/use-report-search-params";
import { ReportPagination } from "@/features/game/components/report/report-pagination";
import { ReportSessionList } from "@/features/game/components/report/report-session-list";
import { ReportToolbar } from "@/features/game/components/report/report-toolbar";
import {
	ReportPageEmptyView,
	ReportPageLoadedView,
	ReportPageLoadingView,
} from "@/features/game/components/report/report-page-view";

export function ReportPageContainer() {
	const { page, pageSize, sort, q, setParams } = useReportSearchParams();
	const queryClient = useQueryClient();

	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null,
	);
	const [quizLoadingId, setQuizLoadingId] = useState<number | null>(null);
	const [quizError, setQuizError] = useState<string | null>(null);

	const [debouncedQ] = useDebounce(q, 300);
	const reportQuery = useReportPageQuery({
		page,
		pageSize,
		q: debouncedQ,
		sort,
	});

	if (reportQuery.isLoading) {
		return <ReportPageLoadingView />;
	}

	const data = reportQuery.data;
	const items = data?.items ?? [];

	const toolbar = (
		<ReportToolbar
			sort={sort}
			q={q}
			onChangeSort={(next) => setParams({ sort: next, page: "1" })}
			onChangeQ={(nextQ) => setParams({ q: nextQ, page: "1" })}
		/>
	);

	if (!data || items.length === 0) {
		return (
			<ReportPageEmptyView
				toolbar={toolbar}
				hasSearchQuery={Boolean(q?.trim())}
			/>
		);
	}

	const pagination = (
		<ReportPagination
			page={data.page}
			totalPages={data.totalPages}
			totalItems={data.totalItems}
			onPrev={() => setParams({ page: String(Math.max(1, data.page - 1)) })}
			onNext={() =>
				setParams({
					page: String(Math.min(data.totalPages, data.page + 1)),
				})
			}
		/>
	);

	const drawer = selectedQuiz ? (
		<QuizDetailsDrawer
			quiz={selectedQuiz}
			onClose={() => setSelectedQuiz(null)}
		/>
	) : null;

	return (
		<ReportPageLoadedView
			toolbar={toolbar}
			reportError={reportQuery.isError}
			quizError={quizError}
			pagination={pagination}
			drawer={drawer}
		>
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
						.then((quiz) =>
							setSelectedQuiz(quiz as unknown as QuizWithQuestions),
						)
						.catch((e) =>
							setQuizError(
								e instanceof Error
									? e.message
									: "Failed to load quiz details.",
							),
						)
						.finally(() => setQuizLoadingId(null));
				}}
			/>
		</ReportPageLoadedView>
	);
}
