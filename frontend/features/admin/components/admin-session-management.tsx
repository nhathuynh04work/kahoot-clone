"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AdminSessionListResponse } from "@/features/admin/api/server-actions";
import type { AdminSessionListItem } from "@/features/admin/api/server-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

const SORT_OPTIONS = [
	{ value: "createdAt_desc", label: "Newest" },
	{ value: "createdAt_asc", label: "Oldest" },
	{ value: "endedAt_desc", label: "Recently ended" },
] as const;

const STATUS_OPTIONS = [
	{ value: "ALL", label: "All statuses" },
	{ value: "CREATED", label: "Created" },
	{ value: "WAITING", label: "Waiting" },
	{ value: "IN_PROGRESS", label: "In progress" },
	{ value: "CLOSED", label: "Closed" },
] as const;

function formatDateTime(iso: string | null) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

export function AdminSessionManagement({
	pageData,
}: {
	pageData: AdminSessionListResponse;
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
			| "endedAt_desc"
			| null) ?? "createdAt_desc";

	const [q, setQ] = useState(urlQ);
	const [status, setStatus] = useState(urlStatus);
	const [sort, setSort] = useState<
		"createdAt_desc" | "createdAt_asc" | "endedAt_desc"
	>(urlSort === "createdAt_asc" ? "createdAt_asc" : urlSort === "endedAt_desc" ? "endedAt_desc" : "createdAt_desc");

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setStatus(urlStatus), [urlStatus]);
	useEffect(() => {
		setSort(urlSort === "createdAt_asc" ? "createdAt_asc" : urlSort === "endedAt_desc" ? "endedAt_desc" : "createdAt_desc");
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

	const columns = useMemo<Array<ColumnDef<AdminSessionListItem>>>(() => {
		return [
			{
				accessorKey: "pin",
				header: "PIN",
				meta: { widthClassName: "w-[110px]" },
				cell: ({ row }) => (
					<Badge tone="neutral" className="text-xs tabular-nums">
						{row.original.pin}
					</Badge>
				),
			},
			{
				accessorKey: "quizTitle",
				header: "Quiz",
				meta: { widthClassName: "w-[420px]" },
				cell: ({ row }) => (
					<div className="min-w-0">
						<Link
							href={`/admin/sessions/${row.original.id}`}
							onClick={(e) => e.stopPropagation()}
							className="text-sm font-semibold text-(--app-fg) truncate hover:text-emerald-600 dark:hover:text-emerald-300"
							title={row.original.quizTitle}
						>
							{row.original.quizTitle}
						</Link>
						<div className="text-xs text-(--app-fg-muted) truncate">{row.original.hostEmail}</div>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				meta: { widthClassName: "w-[160px]" },
				cell: ({ row }) => (
					<Badge tone="neutral" className="text-xs">
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "totalPlayers",
				header: "Players",
				meta: { widthClassName: "w-[120px]" },
				cell: ({ row }) => (
					<span className="text-sm text-(--app-fg-muted) tabular-nums">
						{row.original.totalPlayers ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "endedAt",
				header: "Ended",
				meta: { widthClassName: "w-[220px]" },
				cell: ({ row }) => (
					<span className="text-sm text-(--app-fg-muted)">{formatDateTime(row.original.endedAt)}</span>
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
							placeholder="Search by PIN, quiz title, or host…"
							className="w-full rounded-xl border border-(--app-border) bg-(--app-input-bg) px-4 py-2.5 text-sm text-(--app-fg) placeholder:text-(--app-fg-muted)/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
							aria-label="Search sessions"
						/>
					</div>
					<div className="w-48">
						<Select
							ariaLabel="Filter session status"
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
							ariaLabel="Sort sessions"
							value={sort}
							options={sortOptions}
							onValueChange={(v) => {
								const next =
									v === "createdAt_asc"
										? "createdAt_asc"
										: v === "endedAt_desc"
											? "endedAt_desc"
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
					emptyText="No sessions found."
					onRowClick={(s) => router.push(`/admin/sessions/${s.id}`)}
				/>

				<div className="mt-6 flex items-center justify-between gap-3">
					<div className="text-sm text-(--app-fg-muted)">
						Page <span className="text-(--app-fg) font-medium">{page}</span> of{" "}
						<span className="text-(--app-fg) font-medium">{totalPages}</span>{" "}
						<span className="text-(--app-fg-muted)/60">•</span>{" "}
						<span className="text-(--app-fg-muted)">{totalItems} sessions</span>
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

