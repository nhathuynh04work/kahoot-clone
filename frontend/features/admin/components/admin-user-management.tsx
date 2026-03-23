"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Select } from "@/components/ui/select";
import type {
	AdminUserListItem,
	AdminUserListResponse,
} from "@/features/admin/api/server-actions";
import { updateAdminUser } from "@/features/admin/api/client-actions";

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
								className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
					<div className="grid grid-cols-12 gap-3 text-xs text-gray-400 px-2 py-2 border-b border-gray-800">
						<div className="col-span-4">User</div>
						<div className="col-span-2">Role</div>
						<div className="col-span-2">Status</div>
						<div className="col-span-2">Created</div>
						<div className="col-span-2 text-right">Actions</div>
					</div>

					<div className="divide-y divide-gray-800">
						{pageData.items.map((u) => {
							const blocked = u.isBlocked;
							const roleIsAdmin = u.role === "ADMIN";

							return (
								<div
									key={u.id}
									className="grid grid-cols-12 gap-3 px-2 py-3 items-center"
								>
									<div className="col-span-4 min-w-0">
										<div className="text-sm font-semibold text-white truncate">
											{u.name ?? "—"}{" "}
										</div>
										<div className="text-xs text-gray-400 truncate">{u.email}</div>
									</div>

									<div className="col-span-2">
										<span
											className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
												roleIsAdmin
													? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
													: "bg-indigo-500/10 text-indigo-200 border border-indigo-500/30"
											}`}
										>
											{u.role}
										</span>
									</div>

									<div className="col-span-2">
										<span
											className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
												blocked
													? "bg-red-500/10 text-red-200 border border-red-500/30"
													: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
											}`}
										>
											{blocked ? "BLOCKED" : "ACTIVE"}
										</span>
									</div>

									<div className="col-span-2 text-sm text-gray-300">
										{formatDate(u.createdAt)}
									</div>

									<div className="col-span-2 text-right flex justify-end gap-2">
										<button
											type="button"
											disabled={isPending || (roleIsAdmin && !blocked)}
											onClick={() => {
												if (roleIsAdmin && !blocked) return;
												mutateAsync({
													userId: u.id,
													payload: { isBlocked: !blocked },
												}).catch(() => {});
											}}
											className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{blocked ? "Unblock" : "Block"}
										</button>
										<button
											type="button"
											disabled={isPending || roleIsAdmin}
											onClick={() => {
												if (roleIsAdmin) return;
												mutateAsync({
													userId: u.id,
													payload: {
														role: roleIsAdmin ? "USER" : "ADMIN",
													},
												}).catch(() => {});
											}}
											className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{roleIsAdmin ? "Demote" : "Promote"}
										</button>
									</div>
								</div>
							);
						})}

						{pageData.items.length === 0 && (
							<div className="px-2 py-8 text-center text-gray-400">
								No users found.
							</div>
						)}
					</div>

					<div className="mt-6 flex items-center justify-between gap-3">
						<div className="text-sm text-gray-400">
							Page{" "}
							<span className="text-white font-medium">
								{page}
							</span>{" "}
							of{" "}
							<span className="text-white font-medium">
								{totalPages}
							</span>{" "}
							<span className="text-gray-600">•</span>{" "}
							<span className="text-gray-300">{totalItems} users</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={page <= 1}
								onClick={() => setParams({ page: String(page - 1) })}
								className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
							>
								Prev
							</button>
							<button
								type="button"
								disabled={page >= totalPages}
								onClick={() => setParams({ page: String(page + 1) })}
								className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
							>
								Next
							</button>
						</div>
					</div>

					{isPending && (
						<div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-300">
							<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							Updating user…
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

