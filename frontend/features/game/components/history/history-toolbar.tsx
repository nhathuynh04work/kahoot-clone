"use client";

import type { HistorySort } from "@/features/game/api/server-actions";
import { HistoryQuizFilter } from "./history-quiz-filter";

const SORT_OPTIONS: Array<{ value: HistorySort; label: string }> = [
	{ value: "endedAt_desc", label: "Newest" },
	{ value: "endedAt_asc", label: "Oldest" },
	{ value: "players_desc", label: "Players (high → low)" },
	{ value: "players_asc", label: "Players (low → high)" },
	{ value: "accuracy_desc", label: "Accuracy (high → low)" },
	{ value: "accuracy_asc", label: "Accuracy (low → high)" },
];

export function HistoryToolbar({
	sort,
	onChangeSort,
	quizId,
	onChangeQuizId,
}: {
	sort: HistorySort;
	onChangeSort: (sort: HistorySort) => void;
	quizId?: number;
	onChangeQuizId: (quizId: number | undefined) => void;
}) {
	return (
		<div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
			<div className="flex-1 min-w-0 flex items-center gap-3">
				<label className="text-xs text-gray-400 hidden sm:block">Quiz</label>
				<HistoryQuizFilter quizId={quizId} onChangeQuizId={onChangeQuizId} />
			</div>

			<div className="shrink-0 flex items-center gap-3">
				<label className="text-xs text-gray-400 hidden sm:block">Sort</label>
				<select
					value={sort}
					onChange={(e) => onChangeSort(e.target.value as HistorySort)}
					className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
					aria-label="Sort sessions"
				>
					{SORT_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

