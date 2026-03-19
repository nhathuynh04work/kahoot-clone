"use client";

import type { SessionReport } from "@/features/game/api/server-actions";
import { StatTile } from "@/components/ui/stat-tile";

export interface SessionStatTilesProps {
	report: SessionReport;
}

export function SessionStatTiles({ report }: SessionStatTilesProps) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<StatTile label="Players" value={report.aggregates.totalPlayers} />
			<StatTile label="Questions" value={report.aggregates.totalQuestions} />
			<StatTile
				label="Avg accuracy"
				value={`${(report.aggregates.avgAccuracy * 100).toFixed(1)}%`}
				tone="accent"
			/>
			<StatTile
				label="Answers"
				value={`${report.aggregates.totalCorrect}/${report.aggregates.totalAnswers}`}
			/>
		</div>
	);
}
