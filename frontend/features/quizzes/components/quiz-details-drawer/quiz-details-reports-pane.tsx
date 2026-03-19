"use client";

import { Loader2 } from "lucide-react";
import type {
	SessionListItem,
	SessionReport,
} from "@/features/game/api/server-actions";
import { QuizReportsHeader } from "./quiz-reports-header";
import { QuizDetailsSessionList } from "./quiz-details-session-list";
import { QuizDetailsSessionReportView } from "./quiz-details-session-report-view";

type QuizDetailsReportsPaneProps = {
	sessions: SessionListItem[] | null;
	sessionsLoading: boolean;
	selectedReport: SessionReport | null;
	reportLoading: boolean;
	onViewSession: (lobbyId: number) => void;
	onBackToSessions: () => void;
};

export function QuizDetailsReportsPane({
	sessions,
	sessionsLoading,
	selectedReport,
	reportLoading,
	onViewSession,
	onBackToSessions,
}: QuizDetailsReportsPaneProps) {
	const reportCount = sessions?.length ?? 0;

	return (
		<div className="h-full min-h-0 flex flex-col">
			<QuizReportsHeader reportCount={reportCount} />

			<div className="space-y-4">
				{sessionsLoading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
					</div>
				) : !sessions || sessions.length === 0 ? (
					<p className="text-gray-400 text-center py-8">
						No sessions yet. Start a game to see reports.
					</p>
				) : selectedReport ? (
					<QuizDetailsSessionReportView
						report={selectedReport}
						loading={reportLoading}
						onBack={onBackToSessions}
					/>
				) : (
					<QuizDetailsSessionList
						sessions={sessions}
						onViewSession={onViewSession}
					/>
				)}
			</div>
		</div>
	);
}

