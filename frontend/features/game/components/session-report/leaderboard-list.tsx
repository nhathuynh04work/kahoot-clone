"use client";

import type { SessionReport } from "@/features/game/api/server-actions";

export interface LeaderboardListProps {
	report: SessionReport;
	limit?: number;
}

export function LeaderboardList({ report, limit = 10 }: LeaderboardListProps) {
	const entries = report.leaderboard.slice(0, limit);
	return (
		<div className="rounded-lg border border-(--app-border) bg-(--app-surface-muted)/60 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-(--app-fg)">Leaderboard</p>
				<p className="text-xs text-(--app-fg-muted)">Top {entries.length}</p>
			</div>
			<div className="mt-3 space-y-1">
				{entries.map((entry, i) => (
					<div
						key={`${entry.nickname}-${i}`}
						className="flex justify-between items-center py-2 px-3 rounded-md bg-(--app-surface-muted)/80 border border-(--app-border)/60"
					>
						<span className="text-(--app-fg) text-sm">
							{i + 1}. {entry.nickname}
						</span>
						<span className="text-indigo-600 dark:text-indigo-300 text-sm font-semibold tabular-nums">
							{entry.points} pts
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
