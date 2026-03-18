"use client";

import { Loader2 } from "lucide-react";
import type {
	SessionListItem,
	SessionReport,
} from "@/features/game/api/server-actions";
import { HistorySessionCard } from "@/features/game/components/history-session-card";
import {
	LeaderboardList,
	PerQuestionAccuracyChart,
	PerQuestionStatsList,
	SessionStatTiles,
} from "@/features/game/components/session-report-blocks";

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

type StatsPaneProps = {
	sessions: SessionListItem[] | null;
	sessionsLoading: boolean;
	selectedReport: SessionReport | null;
	reportLoading: boolean;
	onViewSession: (lobbyId: number) => void;
	onBackToSessions: () => void;
};

export function StatsPane({
	sessions,
	sessionsLoading,
	selectedReport,
	reportLoading,
	onViewSession,
	onBackToSessions,
}: StatsPaneProps) {
	return (
		<div className="h-full overflow-auto space-y-4">
			{sessionsLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
				</div>
			) : !sessions || sessions.length === 0 ? (
				<p className="text-gray-400 text-center py-8">
					No sessions yet. Start a game to see stats.
				</p>
			) : selectedReport ? (
				<div className="space-y-4">
					<button
						type="button"
						onClick={onBackToSessions}
						className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
						← Back to sessions
					</button>
					{reportLoading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
						</div>
					) : (
						<SessionReportInline report={selectedReport} />
					)}
				</div>
			) : (
				<div className="space-y-3">
					<p className="text-sm text-gray-400">
						Select a session to view a quick report.
					</p>
					{sessions.map((s) => (
						<div key={s.lobbyId}>
							<HistorySessionCard
								item={{
									...s,
									quizTitle: `${formatDate(s.endedAt ?? s.createdAt)}`,
								}}
								onClick={() => onViewSession(s.lobbyId)}
							/>
							<div className="mt-1 text-xs text-gray-500 px-1">
								{s.totalPlayers} players ·{" "}
								{(s.avgAccuracy * 100).toFixed(1)}% accuracy
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function SessionReportInline({ report }: { report: SessionReport }) {
	return (
		<div className="space-y-4">
			<SessionStatTiles report={report} />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<PerQuestionAccuracyChart report={report} limit={8} />
				<LeaderboardList report={report} limit={8} />
			</div>
			<PerQuestionStatsList report={report} limit={8} />
		</div>
	);
}

