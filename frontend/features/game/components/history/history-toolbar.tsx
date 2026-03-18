"use client";

import type { HistorySort } from "@/features/game/api/server-actions";
import { HistoryQuizFilter } from "./history-quiz-filter";
import { Select } from "@/components/ui/select";

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
				<div className="w-56">
					<Select
						value={sort}
						onValueChange={(v) => onChangeSort(v as HistorySort)}
						options={SORT_OPTIONS}
						ariaLabel="Sort sessions"
						buttonClassName="rounded-lg px-3 py-2"
					/>
				</div>
			</div>
		</div>
	);
}

