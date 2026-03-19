import type { SessionListItem } from "@/features/game/api/server-actions";
import { ReportSessionCard } from "@/features/game/components/report";
import { formatDate } from "@/lib/format";

export function QuizDetailsSessionList({
	sessions,
	onViewSession,
}: {
	sessions: SessionListItem[];
	onViewSession: (lobbyId: number) => void;
}) {
	return (
		<div className="space-y-3">
			{sessions.map((s) => (
				<div key={s.lobbyId}>
					<ReportSessionCard
						item={{
							...s,
							quizTitle: `${formatDate(s.endedAt ?? s.createdAt)}`,
						}}
						onClick={() => onViewSession(s.lobbyId)}
					/>
					<div className="mt-1 text-xs text-gray-500 px-1">
						{s.totalPlayers} players · {(s.avgAccuracy * 100).toFixed(1)}%
						accuracy
					</div>
				</div>
			))}
		</div>
	);
}

