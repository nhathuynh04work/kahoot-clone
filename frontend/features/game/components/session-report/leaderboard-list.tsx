"use client";

import type { SessionReport } from "@/features/game/api/server-actions";

export interface LeaderboardListProps {
	report: SessionReport;
	limit?: number;
}

export function LeaderboardList({ report, limit = 10 }: LeaderboardListProps) {
	const entries = report.leaderboard.slice(0, limit);
	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Leaderboard</p>
				<p className="text-xs text-gray-400">Top {entries.length}</p>
			</div>
			<div className="mt-3 space-y-1">
				{entries.map((entry, i) => (
					<div
						key={`${entry.nickname}-${i}`}
						className="flex justify-between items-center py-2 px-3 rounded-md bg-gray-900/40 border border-gray-700/60"
					>
						<span className="text-white text-sm">
							{i + 1}. {entry.nickname}
						</span>
						<span className="text-indigo-300 text-sm font-semibold tabular-nums">
							{entry.points} pts
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
