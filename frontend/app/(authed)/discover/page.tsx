import type { Metadata } from "next";
import { apiServer } from "@/lib/apiServer";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { DiscoverToolbar } from "@/features/public/components/discover-toolbar";
import { ExploreQuizGrid } from "@/features/public/components/explore-quiz-grid";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import Link from "next/link";
import type { Document } from "@/features/documents/types";
import { DocumentCard } from "@/features/documents/components/document-card";

export const metadata: Metadata = {
	title: "Discover",
	description: "Browse public quizzes.",
	robots: { index: false, follow: false },
};

type PublicQuiz = QuizWithQuestions & { saveCount?: number; playCount?: number };
type PublicQuizPage = {
	items: PublicQuiz[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

type PublicDocumentPage = {
	items: Document[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

function normalizePage(value: string | undefined) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 1;
	return Math.max(1, Math.floor(n));
}

function normalizeTab(value: string | undefined) {
	return value === "documents" ? "documents" : "quizzes";
}

export default async function AuthedDiscoverPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const viewer = await getCurrentUser();
	const api = await apiServer();
	const sp = (await searchParams) ?? {};
	const tab = normalizeTab(typeof sp.tab === "string" ? sp.tab : undefined);
	const q = typeof sp.q === "string" ? sp.q : undefined;
	const page = normalizePage(typeof sp.page === "string" ? sp.page : undefined);
	const pageSize = 24;

	const [publicQuizzes, publicDocuments, mySavedDocumentIds] = await Promise.all([
		tab === "quizzes"
			? api
					.get<PublicQuizPage>(`/public/quizzes`, {
						params: { mode: "recent", q: q?.trim() || undefined, page, pageSize },
					})
					.then((r) => r.data)
			: Promise.resolve(null),
		tab === "documents"
			? api
					.get<PublicDocumentPage>(`/public/documents`, {
						params: { mode: "recent", q: q?.trim() || undefined, page, pageSize },
					})
					.then((r) => r.data)
			: Promise.resolve(null),
		viewer
			? api
					.get<{ ids: number[] }>("/saves/DOCUMENT")
					.then((r) => r.data.ids ?? [])
					.catch(() => [])
			: Promise.resolve([] as number[]),
	]);

	const buildHref = (patch: Record<string, string | number | undefined>) => {
		const params = new URLSearchParams();
		params.set("tab", tab);
		if (q?.trim()) params.set("q", q.trim());
		params.set(
			"page",
			String(
				tab === "quizzes" ? publicQuizzes?.page ?? page : publicDocuments?.page ?? page,
			),
		);
		for (const [k, v] of Object.entries(patch)) {
			if (v === undefined) params.delete(k);
			else params.set(k, String(v));
		}
		return `/discover?${params.toString()}`;
	};

	const pageInfo =
		tab === "quizzes"
			? { page: publicQuizzes?.page ?? page, totalPages: publicQuizzes?.totalPages ?? 1 }
			: {
					page: publicDocuments?.page ?? page,
					totalPages: publicDocuments?.totalPages ?? 1,
				};

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<DiscoverToolbar />

				{tab === "quizzes" ? (
					(publicQuizzes?.items?.length ?? 0) === 0 ? (
						<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center text-gray-400">
							No public quizzes found.
						</div>
					) : (
						<ExploreQuizGrid
							quizzes={(publicQuizzes?.items ?? []) as any}
							viewerId={viewer?.id}
						/>
					)
				) : (publicDocuments?.items?.length ?? 0) === 0 ? (
					<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center text-gray-400">
						No public documents found.
					</div>
				) : (
					<div className="space-y-3">
						{(publicDocuments?.items ?? []).map((doc) => (
							<DocumentCard
								key={doc.id}
								document={doc}
								showDelete={false}
								showVisibilityToggle={false}
								showSave
								isSaved={mySavedDocumentIds.includes(doc.id)}
								viewerId={viewer?.id}
							/>
						))}
					</div>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
					<p className="text-xs text-gray-400">
						Page {pageInfo.page} / {pageInfo.totalPages}
					</p>
					<div className="flex items-center gap-2">
						<Link
							aria-disabled={pageInfo.page <= 1}
							className={[
								"px-3 py-2 rounded-lg text-sm border transition-colors",
								pageInfo.page <= 1
									? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
									: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
							].join(" ")}
							href={buildHref({ page: Math.max(1, pageInfo.page - 1) })}
						>
							Previous
						</Link>
						<Link
							aria-disabled={pageInfo.page >= pageInfo.totalPages}
							className={[
								"px-3 py-2 rounded-lg text-sm border transition-colors",
								pageInfo.page >= pageInfo.totalPages
									? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
									: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
							].join(" ")}
							href={buildHref({
								page: Math.min(pageInfo.totalPages, pageInfo.page + 1),
							})}
						>
							Next
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

