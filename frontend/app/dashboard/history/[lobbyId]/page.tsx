import { getSessionReport } from "@/features/game/api/server-actions";
import { SessionReportDetails } from "@/features/game/components/session-report-details";

export default async function SessionDetailPage({
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

	try {
		const report = await getSessionReport(id);
		return (
			<div className="p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<SessionReportDetails report={report} />
				</div>
			</div>
		);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Failed to load session.";
		return (
			<div className="p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<p className="text-red-400">{message}</p>
				</div>
			</div>
		);
	}
}

