import type { Metadata } from "next";
import {
	getMySavedPublicQuizzes,
	searchQuizzes,
} from "@/features/quizzes/api/server-actions";
import { DashboardQuizToolbar } from "@/features/quizzes/components/dashboard-quiz-toolbar";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { LibraryQuizzesClient } from "./library-quizzes-client";
import Link from "next/link";

export const metadata: Metadata = {
	title: "My quizzes",
	description: "Your saved and created quizzes.",
};

function normalizePage(value: string | undefined) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 1;
	return Math.max(1, Math.floor(n));
}

export default async function LibraryQuizzesPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const viewer = await getCurrentUser();
	const sp = (await searchParams) ?? {};
	const q = typeof sp.q === "string" ? sp.q : undefined;
	const tab =
		typeof sp.tab === "string" && sp.tab === "favorites" ? "favorites" : "my";
	const page = normalizePage(typeof sp.page === "string" ? sp.page : undefined);
	const pageSize = 24;

	const result =
		tab === "favorites"
			? await getMySavedPublicQuizzes().then((items) => {
					const filtered = !q?.trim()
						? items
						: items.filter((quiz) => {
								const needle = q.trim().toLowerCase();
								return (quiz.title ?? "").toLowerCase().includes(needle);
						  });
					const totalItems = filtered.length;
					const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
					const safePage = Math.min(page, totalPages);
					const start = (safePage - 1) * pageSize;
					const paged = filtered.slice(start, start + pageSize);
					return { items: paged, page: safePage, totalPages };
				})
			: await searchQuizzes({
					q,
					page,
					pageSize,
				}).then((r) => ({ items: r.items, page: r.page, totalPages: r.totalPages }));

	const buildHref = (patch: Record<string, string | number | undefined>) => {
		const params = new URLSearchParams();
		params.set("tab", tab);
		if (q?.trim()) params.set("q", q.trim());
		params.set("page", String(result.page));
		for (const [k, v] of Object.entries(patch)) {
			if (v === undefined) params.delete(k);
			else params.set(k, String(v));
		}
		return `/library/quizzes?${params.toString()}`;
	};

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<DashboardQuizToolbar />

				{result.items.length === 0 ? (
					<div className="text-center bg-(--app-surface-muted) p-10 rounded-lg shadow-sm border border-(--app-border)">
						<h3 className="text-xl font-medium text-(--app-fg)">No quizzes found.</h3>
						<p className="text-(--app-fg-muted) my-2">
							Get started by clicking &quot;Create quiz&quot; in the sidebar!
						</p>
					</div>
				) : (
					<>
						<LibraryQuizzesClient quizzes={result.items} viewerId={viewer?.id} />
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
							<p className="text-xs text-(--app-fg-muted)">
								Page {result.page} / {result.totalPages}
							</p>
							<div className="flex items-center gap-2">
								<Link
									aria-disabled={result.page <= 1}
									className={[
										"px-3 py-2 rounded-lg text-sm border transition-colors",
										result.page <= 1
											? "pointer-events-none opacity-50 bg-(--app-surface-muted)/40 border-(--app-border) text-(--app-fg-muted)"
											: "bg-(--app-surface-muted) border-(--app-border) text-(--app-fg) hover:bg-(--app-surface)",
									].join(" ")}
									href={buildHref({ page: Math.max(1, result.page - 1) })}
								>
									Previous
								</Link>
								<Link
									aria-disabled={result.page >= result.totalPages}
									className={[
										"px-3 py-2 rounded-lg text-sm border transition-colors",
										result.page >= result.totalPages
											? "pointer-events-none opacity-50 bg-(--app-surface-muted)/40 border-(--app-border) text-(--app-fg-muted)"
											: "bg-(--app-surface-muted) border-(--app-border) text-(--app-fg) hover:bg-(--app-surface)",
									].join(" ")}
									href={buildHref({
										page: Math.min(result.totalPages, result.page + 1),
									})}
								>
									Next
								</Link>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

