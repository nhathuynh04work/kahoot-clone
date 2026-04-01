import {
	getMySavedPublicQuizzes,
	searchQuizzes,
} from "@/features/quizzes/api/server-actions";
import { DashboardQuizToolbar } from "@/features/quizzes/components/dashboard-quiz-toolbar";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { LibraryQuizzesClient } from "./library-quizzes-client";
import Link from "next/link";

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

				<div className="flex items-center justify-between gap-3 mb-4">
					<p className="text-xs text-gray-400">
						Page {result.page} / {result.totalPages}
					</p>
				</div>

				{result.items.length === 0 ? (
					<div className="text-center bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-700">
						<h3 className="text-xl font-medium text-white">No quizzes found.</h3>
						<p className="text-gray-400 my-2">
							Get started by clicking &quot;Create quiz&quot; in the sidebar!
						</p>
					</div>
				) : (
					<>
						<LibraryQuizzesClient quizzes={result.items} viewerId={viewer?.id} />
						<div className="flex items-center justify-between pt-6">
							<Link
								aria-disabled={result.page <= 1}
								className={[
									"px-3 py-2 rounded-lg text-sm border transition-colors",
									result.page <= 1
										? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
										: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
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
										? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
										: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
								].join(" ")}
								href={buildHref({
									page: Math.min(result.totalPages, result.page + 1),
								})}
							>
								Next
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

