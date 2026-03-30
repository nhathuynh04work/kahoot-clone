import { getSessionReport } from "@/features/game/api/server-actions";
import { SessionReportDetails } from "@/features/game/components/session-report";

export default async function ReportDetailPage({
	params,
}: {
	params: Promise<{ lobbyId: string }>;
}) {
	const { lobbyId } = await params;
	const id = Number(lobbyId);

	if (!Number.isFinite(id)) {
		return (
			<div className="p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<p className="text-red-400">Invalid session id.</p>
				</div>
			</div>
		);
	}

	const report = await getSessionReport(id).catch(() => null);
	if (!report) {
		return (
			<div className="p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<p className="text-red-400">Failed to load session.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<SessionReportDetails report={report} />
			</div>
		</div>
	);
}

