"use client";

import { FolderOpen } from "lucide-react";
import { Search } from "lucide-react";
import { PdfUploadZone } from "./pdf-upload-zone";
import { DocumentCard } from "./document-card";
import { useDocuments, useDocumentsTotalSize } from "../hooks/use-documents";
import {
	MAX_TOTAL_STORAGE_BYTES,
	formatBytes,
} from "../lib/constants";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const SORT_OPTIONS = [
	{ value: "createdAt_desc", label: "Newest" },
	{ value: "createdAt_asc", label: "Oldest" },
	{ value: "name_asc", label: "Name (A–Z)" },
	{ value: "name_desc", label: "Name (Z–A)" },
	{ value: "size_desc", label: "Largest" },
	{ value: "size_asc", label: "Smallest" },
] as const;

type DocumentDashboardSort = (typeof SORT_OPTIONS)[number]["value"];

export function FileManager() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlSort =
		(searchParams.get("sort") as DocumentDashboardSort | null) ??
		"createdAt_desc";

	const [q, setQ] = useState(urlQ);
	const [sort, setSort] = useState<DocumentDashboardSort>(urlSort);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setSort(urlSort), [urlSort]);

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
			setParams({ q: q.trim() ? q.trim() : undefined });
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	const sortOptions = useMemo(() => SORT_OPTIONS, []);

	const { data: documents = [], isLoading, error } = useDocuments({ q, sort });
	const { data: totalSize = 0 } = useDocumentsTotalSize();
	const usagePercent = (totalSize / MAX_TOTAL_STORAGE_BYTES) * 100;

	return (
		<div className="space-y-6">
			{/* Storage usage bar */}
			<div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
				<div className="flex justify-between text-sm mb-2">
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

			{/* Upload zone */}
			<PdfUploadZone />

			{/* Document list */}
			<div>
				<div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<h3 className="text-lg font-medium text-white flex items-center gap-2">
						<FolderOpen className="w-5 h-5 text-gray-400" />
						Documents
					</h3>
				</div>

				<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative w-full sm:max-w-md">
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

					<div className="flex items-center gap-3">
						<label className="text-xs text-gray-400 hidden sm:block">
							Sort
						</label>
						<div className="w-44">
							<Select
								value={sort}
								onValueChange={(v) => {
									const next = v as DocumentDashboardSort;
									setSort(next);
									setParams({ sort: next });
								}}
								options={sortOptions}
								ariaLabel="Sort documents"
							/>
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-12 text-gray-400">
						Loading...
					</div>
				) : error ? (
					<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
						Failed to load
					</div>
				) : documents.length === 0 ? (
					<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
						<p className="text-gray-400">No documents. Upload a PDF above.</p>
					</div>
				) : (
					<div className="space-y-3">
						{documents.map((doc) => (
							<DocumentCard
								key={doc.id}
								document={doc}
								showDelete
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
