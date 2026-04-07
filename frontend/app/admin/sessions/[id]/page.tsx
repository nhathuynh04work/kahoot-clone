import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminSessionDetail } from "@/features/admin/api/server-actions";
import { AdminDetailShell, AdminKeyValueGrid } from "@/features/admin/components/admin-detail-shell";

export const metadata: Metadata = {
	title: "Admin session detail",
};

function formatDateTime(iso: string | null) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

export default async function AdminSessionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const sessionId = parseInt(id, 10);
	if (!Number.isFinite(sessionId)) redirect("/admin/sessions");

	const s = await getAdminSessionDetail(sessionId);

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Sessions", href: "/admin/sessions" },
				{ label: s.pin },
			]}
		>
			<AdminDetailShell>
				<AdminKeyValueGrid
					items={[
						{ label: "Session id", value: s.id },
						{ label: "PIN", value: s.pin },
						{ label: "Status", value: s.status },
						{ label: "Created", value: formatDateTime(s.createdAt) },
						{ label: "Ended", value: formatDateTime(s.endedAt) },
						{
							label: "Quiz",
							value: (
								<Link
									href={`/admin/quizzes/${s.quiz.id}`}
									className="text-emerald-200 hover:text-emerald-100"
								>
									{s.quiz.title}
								</Link>
							),
						},
						{
							label: "Host",
							value: (
								<Link
									href={`/admin/users/${s.host.id}`}
									className="text-emerald-200 hover:text-emerald-100"
								>
									{s.host.email}
								</Link>
							),
						},
					]}
				/>

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<p className="text-sm font-medium text-white">Report</p>
					<div className="mt-3">
						{s.report ? (
							<AdminKeyValueGrid
								items={[
									{ label: "Total players", value: s.report.totalPlayers.toLocaleString() },
									{ label: "Total questions", value: s.report.totalQuestions.toLocaleString() },
									{ label: "Total answers", value: s.report.totalAnswers.toLocaleString() },
									{ label: "Correct", value: s.report.totalCorrect.toLocaleString() },
									{ label: "Incorrect", value: s.report.totalIncorrect.toLocaleString() },
									{ label: "Avg accuracy", value: `${Math.round(s.report.avgAccuracy * 100)}%` },
									{ label: "Report created", value: formatDateTime(s.report.createdAt) },
								]}
							/>
						) : (
							<p className="text-sm text-gray-400">No report available yet.</p>
						)}
					</div>
				</div>
			</AdminDetailShell>
		</AdminManagementShell>
	);
}

