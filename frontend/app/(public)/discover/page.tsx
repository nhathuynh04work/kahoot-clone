import Link from "next/link";
import type { Metadata } from "next";
import { ExploreQuizGrid } from "@/features/public/components/explore-quiz-grid";
import { DocumentCard } from "@/features/documents/components/document-card";
import type { Document } from "@/features/documents/types";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { apiServer } from "@/lib/apiServer";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { ExploreToolbar } from "@/features/public/components/explore-toolbar";

async function fetchJson<T>(url: string) {
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error(`Discover fetch failed: ${res.status}`);
	return (await res.json()) as T;
}

const TABS = ["quizzes", "documents"] as const;
type DiscoverTab = (typeof TABS)[number];

function normalizeTab(value: string | undefined): DiscoverTab {
	if (value && TABS.includes(value as DiscoverTab)) return value as DiscoverTab;
	return "quizzes";
}

export const metadata: Metadata = {
	title: "Discover",
	description:
		"Browse public quizzes and documents on Quiztopia. Save favorites and join live games with a PIN.",
};

function normalizePage(value: string | undefined) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 1;
	return Math.max(1, Math.floor(n));
}

export default async function DiscoverPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};
	const viewer = await getCurrentUser();
	const tab = normalizeTab(typeof sp.tab === "string" ? sp.tab : undefined);
	const q = typeof sp.q === "string" ? sp.q : "";
	const page = normalizePage(typeof sp.page === "string" ? sp.page : undefined);
	const pageSize = 24;

	const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

	const api = await apiServer();
	const [, mySavedDocumentIds] = viewer
		? await Promise.all([
				api.get<{ quizIds: number[] }>("/saves/quizzes").then((r) => r.data.quizIds),
				api
					.get<{ documentIds: number[] }>("/saves/documents")
					.then((r) => r.data.documentIds),
			])
		: [[], []];

	const quizzesRes =
		tab === "quizzes"
			? await fetchJson<{
					items: Array<
						QuizWithQuestions & { saveCount?: number; playCount?: number }
					>;
					page: number;
					pageSize: number;
					totalPages: number;
					totalItems: number;
			  }>(
					`${apiBase}/public/quizzes?mode=recent&page=${page}&pageSize=${pageSize}`,
			  )
			: null;

	const documentsRes =
		tab === "documents"
			? await fetchJson<{
					items: Array<Document & { saveCount?: number; authorName?: string | null }>;
					page: number;
					pageSize: number;
					totalPages: number;
					totalItems: number;
			  }>(
					`${apiBase}/public/documents?mode=mostSaved&page=${page}&pageSize=${pageSize}`,
			  )
			: null;

	const quizzes = (quizzesRes?.items ?? []).filter((quiz) => {
		if (!q.trim()) return true;
		return (quiz.title ?? "").toLowerCase().includes(q.trim().toLowerCase());
	});
	const documents = (documentsRes?.items ?? []).filter((doc) => {
		if (!q.trim()) return true;
		return (doc.fileName ?? "").toLowerCase().includes(q.trim().toLowerCase());
	});

	const totalPages =
		tab === "quizzes"
			? quizzesRes?.totalPages ?? 1
			: documentsRes?.totalPages ?? 1;

	const buildHref = (patch: Record<string, string | number | undefined>) => {
		const params = new URLSearchParams();
		params.set("tab", tab);
		if (q.trim()) params.set("q", q.trim());
		params.set("page", String(page));
		for (const [k, v] of Object.entries(patch)) {
			if (v === undefined) params.delete(k);
			else params.set(k, String(v));
		}
		return `/discover?${params.toString()}`;
	};

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<ExploreToolbar defaultTab={tab} defaultQ={q} />

				{tab === "quizzes" ? (
					quizzes.length === 0 ? (
						<div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 text-center text-gray-400">
							No quizzes found.
						</div>
					) : (
						<ExploreQuizGrid quizzes={quizzes} viewerId={viewer?.id} />
					)
				) : documents.length === 0 ? (
					<div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 text-center text-gray-400">
						No documents found.
					</div>
				) : (
					<div className="space-y-3">
						{documents.map((doc) => (
							<DocumentCard
								key={doc.id}
								document={doc}
								showDelete={false}
								selectable={false}
								showSave
								isSaved={mySavedDocumentIds.includes(doc.id)}
								viewerId={viewer?.id}
							/>
						))}
					</div>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
					<p className="text-xs text-gray-400">
						Page {page} / {totalPages}
					</p>
					<div className="flex items-center gap-2">
						<Link
							aria-disabled={page <= 1}
							className={[
								"px-3 py-2 rounded-lg text-sm border transition-colors",
								page <= 1
									? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
									: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
							].join(" ")}
							href={buildHref({ page: Math.max(1, page - 1) })}
						>
							Previous
						</Link>
						<Link
							aria-disabled={page >= totalPages}
							className={[
								"px-3 py-2 rounded-lg text-sm border transition-colors",
								page >= totalPages
									? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
									: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
							].join(" ")}
							href={buildHref({ page: Math.min(totalPages, page + 1) })}
						>
							Next
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

