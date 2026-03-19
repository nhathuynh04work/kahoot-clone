import { Loader2 } from "lucide-react";
import type { SessionReport } from "@/features/game/api/server-actions";
import {
	LeaderboardList,
	PerQuestionAccuracyChart,
	PerQuestionStatsList,
	SessionStatTiles,
} from "@/features/game/components/session-report";

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

export function QuizDetailsSessionReportView({
	report,
	loading,
	onBack,
}: {
	report: SessionReport;
	loading: boolean;
	onBack: () => void;
}) {
	return (
		<div className="space-y-4">
			<button
				type="button"
				onClick={onBack}
				className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
			>
				← Back to sessions
			</button>
			{loading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
				</div>
			) : (
				<SessionReportInline report={report} />
			)}
		</div>
	);
}

