import type { Metadata } from "next";
import { getSessionReport } from "@/features/game/api/server-actions";
import { SessionReportDetails } from "@/features/game/components/session-report";

type ReportDetailParams = { params: Promise<{ lobbyId: string }> };

export async function generateMetadata({
	params,
}: ReportDetailParams): Promise<Metadata> {
	const { lobbyId } = await params;
	const id = Number(lobbyId);
	if (!Number.isFinite(id)) {
		return { title: "Session report" };
	}
	try {
		const report = await getSessionReport(id);
		const title = report.session.quizTitle?.trim();
		return {
			title: title ? `${title} · Report` : "Session report",
		};
	} catch {
		return { title: "Session report" };
	}
}

export default async function ReportDetailPage({ params }: ReportDetailParams) {
	const { lobbyId } = await params;
	const id = Number(lobbyId);

	if (!Number.isFinite(id)) {
		return (
			<div className="p-4 sm:p-6 md:p-8">
				<div className="max-w-6xl mx-auto">
					<p className="text-red-400">Invalid session id.</p>
				</div>
			</div>
		);
	}

	const report = await getSessionReport(id).catch(() => null);
	if (!report) {
		return (
			<div className="p-4 sm:p-6 md:p-8">
				<div className="max-w-6xl mx-auto">
					<p className="text-red-400">Failed to load session.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 md:p-8">
			<div className="max-w-6xl mx-auto">
				<SessionReportDetails report={report} />
			</div>
		</div>
	);
}

