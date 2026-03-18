"use client";

import { X, Loader2 } from "lucide-react";
import { useSessionReportQuery } from "@/features/game/hooks/use-session-report-query";

interface SessionReportModalProps {
	lobbyId: number;
	onClose: () => void;
}

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleString();
}

export function SessionReportModal({ lobbyId, onClose }: SessionReportModalProps) {
	const reportQuery = useSessionReportQuery(lobbyId);
	const report = reportQuery.data ?? null;
	const loading = reportQuery.isLoading;
	const error = reportQuery.isError
		? reportQuery.error instanceof Error
			? reportQuery.error.message
			: "Failed to load"
		: null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={onClose}>
			<div
				className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-2xl flex flex-col"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
					<h3 className="text-xl font-semibold text-white">
						Session Report
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="flex-1 overflow-auto p-4 space-y-6">
					{loading && (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
						</div>
					)}

					{error && (
						<p className="text-red-400 text-center py-8">{error}</p>
					)}

					{report && !loading && (
						<>
							{/* Session summary */}
							<div>
								<h4 className="text-sm font-medium text-gray-400 mb-2">
									Session
								</h4>
								<p className="text-white font-medium">
									{report.session.quizTitle}
								</p>
								<p className="text-gray-400 text-sm mt-1">
									{formatDate(report.session.createdAt)} –{" "}
									{formatDate(report.session.endedAt)}
								</p>
								<p className="text-gray-500 text-xs mt-1">Completed</p>
							</div>

							{/* Aggregates */}
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								<div className="bg-gray-900/50 rounded-lg p-3">
									<p className="text-gray-400 text-xs">Players</p>
									<p className="text-white font-semibold">
										{report.aggregates.totalPlayers}
									</p>
								</div>
								<div className="bg-gray-900/50 rounded-lg p-3">
									<p className="text-gray-400 text-xs">Questions</p>
									<p className="text-white font-semibold">
										{report.aggregates.totalQuestions}
									</p>
								</div>
								<div className="bg-gray-900/50 rounded-lg p-3">
									<p className="text-gray-400 text-xs">Avg accuracy</p>
									<p className="text-white font-semibold">
										{(report.aggregates.avgAccuracy * 100).toFixed(1)}%
									</p>
								</div>
							</div>

							{/* Leaderboard */}
							<div>
								<h4 className="text-sm font-medium text-gray-400 mb-2">
									Leaderboard
								</h4>
								<div className="space-y-1">
									{report.leaderboard.map((entry, i) => (
										<div
											key={entry.nickname}
											className="flex justify-between items-center py-2 px-3 rounded-md bg-gray-900/50">
											<span className="text-white">
												{i + 1}. {entry.nickname}
											</span>
											<span className="text-indigo-400 font-medium">
												{entry.points} pts
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Per-question stats */}
							<div>
								<h4 className="text-sm font-medium text-gray-400 mb-2">
									Per-question stats
								</h4>
								<div className="space-y-3">
									{report.questions.map((q, i) => (
										<div
											key={q.questionId}
											className="bg-gray-900/50 rounded-lg p-3">
											<p className="text-white text-sm font-medium">
												Q{i + 1}:{" "}
												{q.question?.text?.slice(0, 60) ??
													"Question"}
												{q.question?.text &&
												q.question.text.length > 60
													? "…"
													: ""}
											</p>
											<p className="text-gray-400 text-xs mt-1">
												Correct: {q.correctCount} /{" "}
												{q.correctCount + q.incorrectCount}{" "}
												(
												{(q.correctRate * 100).toFixed(0)}
												%)
											</p>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
