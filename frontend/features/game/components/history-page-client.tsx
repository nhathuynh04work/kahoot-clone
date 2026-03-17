"use client";

import { useEffect, useState } from "react";
import {
	getRecentSessions,
	type RecentSessionsResponse,
} from "@/features/game/api/server-actions";
import { Clock3, Loader2 } from "lucide-react";
import { HistorySessionCard } from "./history-session-card";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsModal } from "@/features/quizzes/components/quiz-details-modal";

export function HistoryPageClient() {
	const [data, setData] = useState<RecentSessionsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(
		null,
	);
	const [quizLoadingId, setQuizLoadingId] = useState<number | null>(null);
	const [quizError, setQuizError] = useState<string | null>(null);

	useEffect(() => {
		getRecentSessions({ limit: 30 })
			.then(setData)
			.catch(() => setData({ items: [], nextCursor: null }))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	if (!data || data.items.length === 0) {
		return (
			<div className="text-center bg-gray-800/50 p-10 rounded-lg border border-gray-700">
				<div className="mx-auto w-12 h-12 rounded-xl bg-gray-700/60 border border-gray-700 flex items-center justify-center">
					<Clock3 className="w-6 h-6 text-indigo-300" />
				</div>
				<h3 className="mt-4 text-xl font-semibold text-white">
					No sessions yet
				</h3>
				<p className="text-gray-400 mt-2">
					Complete a quiz game to see your session snapshots and reports here.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{quizError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{quizError}
					</div>
				) : null}
				{data.items.map((item) => (
					<HistorySessionCard
						key={item.lobbyId}
						item={item}
						href={`/dashboard/history/${item.lobbyId}`}
						quizTitleLoading={quizLoadingId === item.quizId}
						onQuizTitleClick={() => {
							if (quizLoadingId !== null) return;
							setQuizError(null);
							setQuizLoadingId(item.quizId);
							getQuiz(String(item.quizId))
								.then((q) => setSelectedQuiz(q as unknown as QuizWithQuestions))
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
				))}
			</div>

			{selectedQuiz ? (
				<QuizDetailsModal
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
				/>
			) : null}
		</>
	);
}
