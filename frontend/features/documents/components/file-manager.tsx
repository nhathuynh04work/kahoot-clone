"use client";

import { Search } from "lucide-react";
import { PdfUploadZone } from "./pdf-upload-zone";
import { DocumentCard } from "./document-card";
import { useDocumentsPage, useDocumentsTotalSize } from "../hooks/use-documents";
import { getMySavedDocumentIds, getMySavedPublicDocuments } from "../api/client-actions";
import {
	MAX_TOTAL_STORAGE_BYTES,
	formatBytes,
} from "../lib/constants";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

const TABS = ["my", "favorites"] as const;
type DocumentDashboardTab = (typeof TABS)[number];

function normalizeTab(tab: string | null): DocumentDashboardTab {
	if (tab === "favorites") return "favorites";
	return "my";
}

function normalizePage(value: string | null) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 1;
	return Math.max(1, Math.floor(n));
}

export function FileManager({ viewerId }: { viewerId?: number }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlTab = normalizeTab(searchParams.get("tab"));
	const urlPage = normalizePage(searchParams.get("page"));

	const [q, setQ] = useState(urlQ);
	const [tab, setTab] = useState<DocumentDashboardTab>(urlTab);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setTab(urlTab), [urlTab]);

	const setParams = (patch: Record<string, string | undefined>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (!v) next.delete(k);
			else next.set(k, v);
		}
		router.replace(`${pathname}?${next.toString()}`);
	};

	useEffect(() => {
		const t = setTimeout(() => {
			setParams({ q: q.trim() ? q.trim() : undefined, page: "1" });
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	useEffect(() => {
		setParams({ tab, page: "1" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab]);

	const pageSize = 24;
	const { data: docsPage, isLoading, error } = useDocumentsPage({
		q,
		page: urlPage,
		pageSize,
	});
	const documents = docsPage?.items ?? [];
	const { data: totalSize = 0 } = useDocumentsTotalSize();
	const { data: mySavedDocumentIds = [] } = useQuery({
		queryKey: ["mySavedDocuments"],
		queryFn: getMySavedDocumentIds,
	});
	const { data: favoriteDocuments = [], isLoading: isLoadingFavorites } = useQuery({
		queryKey: ["mySavedPublicDocuments"],
		queryFn: getMySavedPublicDocuments,
		enabled: tab === "favorites",
	});

	const filteredFavorites = useMemo(() => {
		if (!q.trim()) return favoriteDocuments;
		const needle = q.trim().toLowerCase();
		return favoriteDocuments.filter((d) =>
			(d.fileName ?? "").toLowerCase().includes(needle),
		);
	}, [favoriteDocuments, q]);
	const usagePercent = (totalSize / MAX_TOTAL_STORAGE_BYTES) * 100;

	const favoritesPage = useMemo(() => {
		const totalItems = filteredFavorites.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
		const safePage = Math.min(urlPage, totalPages);
		const start = (safePage - 1) * pageSize;
		return {
			items: filteredFavorites.slice(start, start + pageSize),
			page: safePage,
			totalPages,
		};
	}, [filteredFavorites, pageSize, urlPage]);

	const pageInfo =
		tab === "favorites"
			? favoritesPage
			: { page: docsPage?.page ?? urlPage, totalPages: docsPage?.totalPages ?? 1 };

	return (
		<div className="space-y-4">
			{/* Header: tabs + search */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SegmentedTabs
					tabs={[
						{ id: "my", label: "My docs" },
						{ id: "favorites", label: "Favorites" },
					]}
					activeId={tab}
					onChange={setTab}
				/>

				<div className="relative w-full sm:max-w-sm sm:ml-auto">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
						aria-hidden
					/>
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						type="search"
						placeholder="Search by name…"
						className="w-full rounded-xl border border-gray-700 bg-gray-800/50 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
						aria-label="Search documents by name"
					/>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-gray-400">
					Page {pageInfo.page} / {pageInfo.totalPages}
				</p>
			</div>

			{/* Storage usage bar */}
			{tab === "my" && (
				<div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
					<div className="flex justify-between text-xs mb-1">
						<span className="text-gray-400">Storage</span>
						<span className="text-white font-medium">
							{formatBytes(totalSize)} / {formatBytes(MAX_TOTAL_STORAGE_BYTES)}
						</span>
					</div>
					<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-indigo-500 rounded-full transition-all duration-500"
							style={{ width: `${Math.min(100, usagePercent)}%` }}
						/>
					</div>
				</div>
			)}

			{/* Upload zone (My docs only) */}
			{tab === "my" && <PdfUploadZone />}

			{/* Document list */}
			{tab === "my" && isLoading ? (
				<div className="flex items-center justify-center py-12 text-gray-400">
					Loading...
				</div>
			) : tab === "my" && error ? (
				<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
					Failed to load
				</div>
			) : tab === "my" && documents.length === 0 ? (
				<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
					<p className="text-gray-400">No documents. Upload a PDF above.</p>
				</div>
			) : tab === "favorites" && isLoadingFavorites ? (
				<div className="flex items-center justify-center py-12 text-gray-400">
					Loading...
				</div>
			) : tab === "favorites" && filteredFavorites.length === 0 ? (
				<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
					<p className="text-gray-400">No favorites to show.</p>
				</div>
			) : tab === "favorites" ? (
				<div className="space-y-3">
					{favoritesPage.items.map((doc) => (
						<DocumentCard
							key={doc.id}
							document={doc}
							showDelete={false}
							showVisibilityToggle={false}
							showSave
							isSaved={mySavedDocumentIds.includes(doc.id)}
							viewerId={viewerId}
						/>
					))}
				</div>
			) : (
				<div className="space-y-3">
					{documents.map((doc) => (
						<DocumentCard
							key={doc.id}
							document={doc}
							showDelete
							showVisibilityToggle
							showSave
							isSaved={mySavedDocumentIds.includes(doc.id)}
							viewerId={viewerId}
						/>
					))}
				</div>
			)}

			<div className="flex items-center justify-between pt-2">
				<button
					type="button"
					disabled={pageInfo.page <= 1}
					className={[
						"px-3 py-2 rounded-lg text-sm border transition-colors",
						pageInfo.page <= 1
							? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
							: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
					].join(" ")}
					onClick={() => setParams({ page: String(Math.max(1, pageInfo.page - 1)) })}
				>
					Previous
				</button>
				<button
					type="button"
					disabled={pageInfo.page >= pageInfo.totalPages}
					className={[
						"px-3 py-2 rounded-lg text-sm border transition-colors",
						pageInfo.page >= pageInfo.totalPages
							? "pointer-events-none opacity-50 bg-gray-800/30 border-gray-700 text-gray-400"
							: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
					].join(" ")}
					onClick={() =>
						setParams({
							page: String(Math.min(pageInfo.totalPages, pageInfo.page + 1)),
						})
					}
				>
					Next
				</button>
			</div>
		</div>
	);
}
