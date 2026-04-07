"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Select } from "@/components/ui/select";
import type { AdminDocumentListResponse } from "@/features/admin/api/server-actions";
import type { AdminDocumentListItem } from "@/features/admin/api/server-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

const SORT_OPTIONS = [
	{ value: "createdAt_desc", label: "Newest" },
	{ value: "createdAt_asc", label: "Oldest" },
	{ value: "saves_desc", label: "Most saved" },
] as const;

const STATUS_OPTIONS = [
	{ value: "ALL", label: "All statuses" },
	{ value: "UPLOADED", label: "Uploaded" },
	{ value: "PARSING", label: "Parsing" },
	{ value: "READY", label: "Ready" },
	{ value: "ERROR", label: "Error" },
] as const;

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleDateString();
	} catch {
		return iso;
	}
}

function formatBytes(bytes: number) {
	if (!Number.isFinite(bytes)) return "—";
	const kb = 1024;
	const mb = kb * 1024;
	if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MB`;
	if (bytes >= kb) return `${Math.round(bytes / kb)} KB`;
	return `${bytes} B`;
}

export function AdminDocumentManagement({
	pageData,
}: {
	pageData: AdminDocumentListResponse;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlStatus = searchParams.get("status") ?? "ALL";
	const urlSort =
		(searchParams.get("sort") as
			| "createdAt_desc"
			| "createdAt_asc"
			| "saves_desc"
			| null) ?? "createdAt_desc";

	const [q, setQ] = useState(urlQ);
	const [status, setStatus] = useState(urlStatus);
	const [sort, setSort] = useState<
		"createdAt_desc" | "createdAt_asc" | "saves_desc"
	>(urlSort === "createdAt_asc" ? "createdAt_asc" : urlSort === "saves_desc" ? "saves_desc" : "createdAt_desc");

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setStatus(urlStatus), [urlStatus]);
	useEffect(() => {
		setSort(urlSort === "createdAt_asc" ? "createdAt_asc" : urlSort === "saves_desc" ? "saves_desc" : "createdAt_desc");
	}, [urlSort]);

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

	const sortOptions = useMemo(
		() => SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
		[],
	);
	const statusOptions = useMemo(
		() => STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
		[],
	);

	const totalPages = pageData.totalPages;
	const page = pageData.page;
	const totalItems = pageData.totalItems;

	const columns = useMemo<Array<ColumnDef<AdminDocumentListItem>>>(() => {
		return [
			{
				accessorKey: "fileName",
				header: "Document",
				meta: { widthClassName: "w-[420px]" },
				cell: ({ row }) => (
					<div className="min-w-0">
						<Link
							href={`/admin/documents/${row.original.id}`}
							onClick={(e) => e.stopPropagation()}
							className="text-sm font-semibold text-white truncate hover:text-emerald-100"
							title={row.original.fileName}
						>
							{row.original.fileName}
						</Link>
						<div className="text-xs text-gray-400 truncate">{row.original.authorEmail}</div>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				meta: { widthClassName: "w-[160px]" },
				cell: ({ row }) => (
					<span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-gray-800/70 text-gray-200 border border-gray-700">
						{row.original.status}
					</span>
				),
			},
			{
				accessorKey: "fileSize",
				header: "Size",
				meta: { widthClassName: "w-[120px]" },
				cell: ({ row }) => (
					<span className="text-sm text-gray-300 tabular-nums">
						{formatBytes(row.original.fileSize)}
					</span>
				),
			},
			{
				accessorKey: "savesCount",
				header: "Saved",
				meta: { widthClassName: "w-[110px]" },
				cell: ({ row }) => (
					<span className="text-sm text-gray-300 tabular-nums">
						{row.original.savesCount.toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				meta: { widthClassName: "w-[140px]" },
				cell: ({ row }) => (
					<span className="text-sm text-gray-300">{formatDate(row.original.createdAt)}</span>
				),
			},
		];
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3 flex-wrap">
					<div className="w-full sm:w-72">
						<input
							type="search"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Search documents…"
							className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
							aria-label="Search documents"
						/>
					</div>
					<div className="w-48">
						<Select
							ariaLabel="Filter document status"
							value={status}
							options={statusOptions}
							onValueChange={(v) => {
								setStatus(v);
								setParams({ status: v === "ALL" ? undefined : v, page: "1" });
							}}
						/>
					</div>
					<div className="w-44">
						<Select
							ariaLabel="Sort documents"
							value={sort}
							options={sortOptions}
							onValueChange={(v) => {
								const next =
									v === "createdAt_asc"
										? "createdAt_asc"
										: v === "saves_desc"
											? "saves_desc"
											: "createdAt_desc";
								setSort(next);
								setParams({ sort: next, page: "1" });
							}}
						/>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<AdminDataTable
					data={pageData.items}
					columns={columns}
					emptyText="No documents found."
					onRowClick={(d) => router.push(`/admin/documents/${d.id}`)}
				/>

				<div className="mt-6 flex items-center justify-between gap-3">
					<div className="text-sm text-gray-400">
						Page <span className="text-white font-medium">{page}</span> of{" "}
						<span className="text-white font-medium">{totalPages}</span>{" "}
						<span className="text-gray-600">•</span>{" "}
						<span className="text-gray-300">{totalItems} documents</span>
					</div>
					<AdminPagination
						page={page}
						totalPages={totalPages}
						onPageChange={(p) => setParams({ page: String(p) })}
					/>
				</div>
			</div>
		</div>
	);
}

