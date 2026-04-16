import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminQuizDetail } from "@/features/admin/api/server-actions";
import { AdminDetailShell, AdminKeyValueGrid } from "@/features/admin/components/admin-detail-shell";

export const metadata: Metadata = {
	title: "Admin quiz detail",
};

function formatDateTime(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

export default async function AdminQuizDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const quizId = parseInt(id, 10);
	if (!Number.isFinite(quizId)) redirect("/admin/quizzes");

	const quiz = await getAdminQuizDetail(quizId);

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Quizzes", href: "/admin/quizzes" },
				{ label: quiz.title },
			]}
		>
			<AdminDetailShell>
				<AdminKeyValueGrid
					items={[
						{ label: "Quiz id", value: quiz.id },
						{ label: "Title", value: quiz.title },
						{ label: "Visibility", value: quiz.visibility },
						{ label: "Created", value: formatDateTime(quiz.createdAt) },
						{
							label: "Author",
							value: (
								<Link
									href={`/admin/users/${quiz.author.id}`}
									className="text-emerald-200 hover:text-emerald-100"
								>
									{quiz.author.email}
								</Link>
							),
						},
						{ label: "Questions", value: quiz.counts.questions.toLocaleString() },
						{ label: "Saves", value: quiz.counts.saves.toLocaleString() },
						{ label: "Sessions", value: quiz.counts.sessions.toLocaleString() },
					]}
				/>

				<div className="rounded-xl border border-(--app-border) bg-(--app-surface-muted) p-4">
					<p className="text-sm font-medium text-(--app-fg)">Recent sessions</p>
					<div className="mt-3 space-y-2">
						{quiz.recentSessions.length ? (
							quiz.recentSessions.map((s) => (
								<Link
									key={s.id}
									href={`/admin/sessions/${s.id}`}
									className="block rounded-lg border border-(--app-border) bg-(--app-surface) hover:bg-(--app-surface-muted) transition-colors px-3 py-2"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-(--app-fg) truncate">
												{s.pin} <span className="text-(--app-fg-muted)/60">•</span> {s.status}
											</p>
											<p className="text-xs text-(--app-fg-muted) truncate">
												Host: {s.hostEmail}
											</p>
										</div>
										<div className="text-xs text-(--app-fg-muted) text-right tabular-nums shrink-0">
											<div>{s.totalPlayers ?? "—"} players</div>
											<div>{s.endedAt ? formatDateTime(s.endedAt) : "—"}</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<p className="text-sm text-(--app-fg-muted)">No sessions yet.</p>
						)}
					</div>
				</div>
			</AdminDetailShell>
		</AdminManagementShell>
	);
}

