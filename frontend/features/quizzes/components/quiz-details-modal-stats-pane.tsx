"use client";

import { Loader2 } from "lucide-react";
import type {
	SessionListItem,
	SessionReport,
} from "@/features/game/api/server-actions";

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
						className="text-sm text-indigo-400 hover:text-indigo-300">
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
				<div className="space-y-2">
					{sessions.map((s) => (
						<button
							key={s.lobbyId}
							type="button"
							onClick={() => onViewSession(s.lobbyId)}
							className="w-full text-left p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors">
							<p className="text-white font-medium">
								{formatDate(s.endedAt ?? s.createdAt)}
							</p>
							<p className="text-gray-400 text-sm">
								{s.totalPlayers} players ·{" "}
								{(s.avgAccuracy * 100).toFixed(1)}% accuracy
							</p>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function SessionReportInline({ report }: { report: SessionReport }) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
				<div className="bg-gray-900/50 rounded-lg p-2">
					<p className="text-gray-400 text-xs">Players</p>
					<p className="text-white font-semibold">
						{report.aggregates.totalPlayers}
					</p>
				</div>
				<div className="bg-gray-900/50 rounded-lg p-2">
					<p className="text-gray-400 text-xs">Accuracy</p>
					<p className="text-white font-semibold">
						{(report.aggregates.avgAccuracy * 100).toFixed(1)}%
					</p>
				</div>
			</div>
			<div>
				<h4 className="text-sm font-medium text-gray-400 mb-2">
					Leaderboard
				</h4>
				<div className="space-y-1">
					{report.leaderboard.map((entry, i) => (
						<div
							key={entry.nickname}
							className="flex justify-between py-1.5 px-2 rounded bg-gray-900/50">
							<span className="text-white text-sm">
								{i + 1}. {entry.nickname}
							</span>
							<span className="text-indigo-400 text-sm font-medium">
								{entry.points} pts
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

