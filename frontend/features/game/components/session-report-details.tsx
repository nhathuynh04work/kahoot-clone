"use client";

import { useState } from "react";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import type { SessionReport } from "@/features/game/api/server-actions";
import { cn } from "@/lib/utils";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsModal } from "@/features/quizzes/components/quiz-details-modal";
import { useQueryClient } from "@tanstack/react-query";
import { quizQueryKeys } from "@/features/quizzes/hooks/use-quiz-search-infinite";
import {
	LeaderboardList,
	PerQuestionAccuracyChart,
	PerQuestionStatsList,
	SessionStatTiles,
} from "./session-report-blocks";

function formatDateTime(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleString();
}

function formatDurationMs(ms: number | null) {
	if (ms === null || !Number.isFinite(ms) || ms <= 0) return "—";
	const totalSeconds = Math.round(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes <= 0) return `${seconds}s`;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function SessionReportDetails({
	report,
	backHref = "/dashboard/history",
	showBack = true,
}: {
	report: SessionReport;
	backHref?: string;
	showBack?: boolean;
}) {
	const queryClient = useQueryClient();
	const displayTitle = report.session.quizTitle?.trim()
		? report.session.quizTitle
		: "Untitled Quiz";

	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null,
	);
	const [quizLoading, setQuizLoading] = useState(false);

	const StatusIcon = CheckCircle2;
	const statusText = "Completed";
	const statusTone = "text-emerald-500";

	const createdAt = report.session.createdAt
		? new Date(report.session.createdAt).getTime()
		: null;
	const endedAt = report.session.endedAt
		? new Date(report.session.endedAt).getTime()
		: null;
	const durationMs =
		createdAt !== null && endedAt !== null ? endedAt - createdAt : null;

	return (
		<div className="space-y-5">
			{showBack && (
				<Link
					href={backHref}
					className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to history
				</Link>
			)}

			<div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<StatusIcon className={cn("w-5 h-5", statusTone)} />
							<h1 className="text-lg sm:text-xl font-semibold text-white truncate">
								<button
									type="button"
									disabled={quizLoading}
									onClick={() => {
										if (quizLoading) return;
										setQuizLoading(true);
										queryClient
											.fetchQuery({
												queryKey: quizQueryKeys.details(report.session.quizId),
												queryFn: () => getQuiz(String(report.session.quizId)),
											})
											.then((q) =>
												setSelectedQuiz(q as unknown as QuizWithQuestions),
											)
											.finally(() => setQuizLoading(false));
									}}
									className={cn(
										"inline-flex items-center gap-2 text-left truncate",
										"hover:text-indigo-300 transition-colors",
										"disabled:opacity-60 disabled:cursor-not-allowed",
									)}
									aria-label={`Open quiz details: ${displayTitle}`}
								>
									<span className="truncate">{displayTitle}</span>
									{quizLoading ? (
										<Loader2 className="w-4 h-4 animate-spin text-indigo-300 shrink-0" />
									) : null}
								</button>
							</h1>
							<span
								className={cn(
									"shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border",
									"bg-gray-900/40 border-gray-700",
									statusTone,
								)}
							>
								{statusText}
							</span>
						</div>
						<div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-400">
							<div className="inline-flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-500" />
								<span className="tabular-nums">
									{formatDateTime(report.session.createdAt)}
								</span>
								<span className="text-gray-600">→</span>
								<span className="tabular-nums">
									{formatDateTime(report.session.endedAt)}
								</span>
							</div>
							<span className="hidden sm:inline text-gray-600">•</span>
							<div className="inline-flex items-center gap-2">
								<Clock className="w-4 h-4 text-gray-500" />
								<span className="tabular-nums">{formatDurationMs(durationMs)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<SessionStatTiles report={report} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<PerQuestionAccuracyChart report={report} limit={10} />
				<LeaderboardList report={report} limit={10} />
			</div>

			<PerQuestionStatsList report={report} />

			{selectedQuiz ? (
				<QuizDetailsModal
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			) : null}
		</div>
	);
}

