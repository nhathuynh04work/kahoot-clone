"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, Crown, Loader2, Unlock, UserRound } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
	AdminUserListItem,
	AdminUserListResponse,
} from "@/features/admin/api/server-actions";
import { updateAdminUser } from "@/features/admin/api/client-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

const SORT_OPTIONS = [
	{ value: "createdAt_desc", label: "Newest" },
	{ value: "createdAt_asc", label: "Oldest" },
] as const;

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleDateString();
	} catch {
		return iso;
	}
}

export function AdminUserManagement({
	pageData,
}: {
	pageData: AdminUserListResponse;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlSort =
		(searchParams.get("sort") as "createdAt_desc" | "createdAt_asc" | null) ??
		"createdAt_desc";

	const [q, setQ] = useState(urlQ);
	const [sort, setSort] = useState<"createdAt_desc" | "createdAt_asc">(
		urlSort === "createdAt_asc" ? "createdAt_asc" : "createdAt_desc",
	);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setSort(urlSort === "createdAt_asc" ? "createdAt_asc" : "createdAt_desc"), [urlSort]);

	const setParams = (patch: Record<string, string | undefined>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (!v) next.delete(k);
			else next.set(k, v);
		}
		router.replace(`${pathname}?${next.toString()}`);
	};

	// Debounce search.
	useEffect(() => {
		const t = setTimeout(() => {
			setParams({ q: q.trim() ? q.trim() : undefined, page: "1" });
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: ({
			userId,
			payload,
		}: {
			userId: number;
			payload: { role?: "USER" | "ADMIN"; isBlocked?: boolean };
		}) => updateAdminUser(userId, payload),
		onSuccess: () => {
			toast.success("User updated.");
			router.refresh();
		},
		onError: (err: unknown) => {
			const msg = err instanceof Error ? err.message : "Failed to update user.";
			toast.error(msg);
		},
	});

	const totalPages = pageData.totalPages;
	const page = pageData.page;
	const totalItems = pageData.totalItems;

	const sortOptions = useMemo(
		() =>
			SORT_OPTIONS.map((o) => ({
				value: o.value,
				label: o.label,
			})),
		[],
	);

	const columns = useMemo<Array<ColumnDef<AdminUserListItem>>>(() => {
		return [
			{
				accessorKey: "email",
				header: "User",
				meta: { widthClassName: "w-[420px]" },
				cell: ({ row }) => (
					<div className="min-w-0">
						<div className="text-sm font-semibold text-(--app-fg) truncate">
							{row.original.name ?? "—"}
						</div>
						<div className="text-xs text-(--app-fg-muted) truncate">
							{row.original.email}
						</div>
					</div>
				),
			},
			{
				accessorKey: "role",
				header: "Role",
				meta: { widthClassName: "w-[140px]" },
				cell: ({ row }) => {
					return (
						<Badge tone="neutral" className="text-xs">
							{row.original.role}
						</Badge>
					);
				},
			},
			{
				accessorKey: "isBlocked",
				header: "Status",
				meta: { widthClassName: "w-[140px]" },
				cell: ({ row }) => {
					const blocked = row.original.isBlocked;
					return (
						<Badge tone="neutral" className="text-xs">
							{blocked ? "BLOCKED" : "ACTIVE"}
						</Badge>
					);
				},
				sortingFn: "basic",
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				meta: { widthClassName: "w-[140px]" },
				cell: ({ row }) => (
					<span className="text-sm text-(--app-fg-muted)">
						{formatDate(row.original.createdAt)}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: {
					widthClassName: "w-[108px]",
					headerAlign: "right",
				},
				cell: ({ row }) => {
					const u = row.original;
					const blocked = u.isBlocked;
					const roleIsAdmin = u.role === "ADMIN";
					const blockDisabled = isPending || (roleIsAdmin && !blocked);
					const roleDisabled = isPending || roleIsAdmin;

					return (
						<div
							className="flex justify-end gap-1.5"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								type="button"
								disabled={blockDisabled}
								aria-label={blocked ? "Unblock user" : "Block user"}
								title={blocked ? "Unblock" : "Block"}
								onClick={() => {
									if (roleIsAdmin && !blocked) return;
									mutateAsync({
										userId: u.id,
										payload: { isBlocked: !blocked },
									}).catch(() => {});
								}}
								className="inline-flex size-9 items-center justify-center rounded-lg border border-(--app-border) bg-(--app-control-bg) text-(--app-fg) hover:bg-(--app-control-bg-hover) disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:size-4"
							>
								{blocked ? (
									<Unlock className="" aria-hidden />
								) : (
									<Ban className="" aria-hidden />
								)}
							</button>
							<button
								type="button"
								disabled={roleDisabled}
								aria-label={roleIsAdmin ? "Demote to user" : "Promote to admin"}
								title={roleIsAdmin ? "Demote" : "Promote"}
								onClick={() => {
									if (roleIsAdmin) return;
									mutateAsync({
										userId: u.id,
										payload: {
											role: roleIsAdmin ? "USER" : "ADMIN",
										},
									}).catch(() => {});
								}}
								className="inline-flex size-9 items-center justify-center rounded-lg border border-(--app-border) bg-(--app-control-bg) text-(--app-fg) hover:bg-(--app-control-bg-hover) disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:size-4"
							>
								{roleIsAdmin ? (
									<UserRound className="" aria-hidden />
								) : (
									<Crown className="" aria-hidden />
								)}
							</button>
						</div>
					);
				},
			},
		];
	}, [isPending, mutateAsync]);

	return (
		<div className="space-y-4">
			<div className="contents">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="w-full sm:w-72">
							<input
								type="search"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Search email or name…"
								className="w-full rounded-xl border border-(--app-border) bg-(--app-input-bg) px-4 py-2.5 text-sm text-(--app-fg) placeholder:text-(--app-fg-muted)/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
								aria-label="Search users"
							/>
						</div>
						<div className="w-44">
							<Select
								ariaLabel="Sort users"
								value={sort}
								options={sortOptions}
								onValueChange={(v) => {
									const next = v === "createdAt_asc" ? "createdAt_asc" : "createdAt_desc";
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
						emptyText="No users found."
						onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
					/>

					<div className="mt-6 flex items-center justify-between gap-3">
						<div className="text-sm text-(--app-fg-muted)">
							Page{" "}
							<span className="text-(--app-fg) font-medium">
								{page}
							</span>{" "}
							of{" "}
							<span className="text-(--app-fg) font-medium">
								{totalPages}
							</span>{" "}
							<span className="text-(--app-fg-muted)/60">•</span>{" "}
							<span className="text-(--app-fg-muted)">{totalItems} users</span>
						</div>
						<AdminPagination
							page={page}
							totalPages={totalPages}
							onPageChange={(p) => setParams({ page: String(p) })}
						/>
					</div>

					{isPending && (
						<div className="mt-3 flex items-center justify-center gap-2 text-sm text-(--app-fg-muted)">
							<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							Updating user…
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

