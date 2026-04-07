"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";
import type { AdminRevenuePageResponse } from "@/features/admin/api/server-actions";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

const PAGE_SIZE_OPTIONS = [
	{ value: "25", label: "25 / page" },
	{ value: "50", label: "50 / page" },
	{ value: "100", label: "100 / page" },
] as const;

function formatDateTime(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function formatMoney(amountCents: number, currency: string) {
	const amt = (amountCents ?? 0) / 100;
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: currency?.toUpperCase() || "USD",
		}).format(amt);
	} catch {
		return `${currency?.toUpperCase() ?? "USD"} ${(amt).toFixed(2)}`;
	}
}

export function AdminRevenueManagement({
	pageData,
}: {
	pageData: AdminRevenuePageResponse;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlPageSize = searchParams.get("pageSize") ?? String(pageData.ledger.pageSize);

	const [q, setQ] = useState(urlQ);
	const [pageSize, setPageSize] = useState(urlPageSize);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setPageSize(urlPageSize), [urlPageSize]);

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

	const pageSizeOptions = useMemo(
		() => PAGE_SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
		[],
	);

	const { items, page, totalPages, totalItems } = pageData.ledger;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3 flex-wrap">
					<div className="w-full sm:w-72">
						<input
							type="search"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Search invoice id or user email…"
							className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
							aria-label="Search revenue ledger"
						/>
					</div>
					<div className="w-40">
						<Select
							ariaLabel="Page size"
							value={pageSize}
							options={pageSizeOptions}
							onValueChange={(v) => {
								setPageSize(v);
								setParams({ pageSize: v, page: "1" });
							}}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3">
				<p className="text-sm font-medium text-white">Recent purchases</p>

				<div className="mt-3">
					<div className="grid grid-cols-12 gap-3 text-xs text-gray-400 px-2 py-2 border-b border-gray-800">
						<div className="col-span-5">Invoice</div>
						<div className="col-span-3">User</div>
						<div className="col-span-2">Amount</div>
						<div className="col-span-2">Occurred</div>
					</div>
					<div className="divide-y divide-gray-800">
						{items.map((e) => (
							<div key={e.id} className="grid grid-cols-12 gap-3 px-2 py-3 items-center">
								<div className="col-span-5 min-w-0">
									<div className="text-sm font-semibold text-white truncate" title={e.stripeInvoiceId}>
										{e.stripeInvoiceId}
									</div>
									<div className="text-xs text-gray-400 truncate">{e.currency.toUpperCase()}</div>
								</div>
								<div className="col-span-3 text-sm text-gray-300 truncate" title={e.userEmail ?? undefined}>
									{e.userEmail ?? "—"}
								</div>
								<div className="col-span-2 text-sm text-gray-300 tabular-nums">
									{formatMoney(e.amountCents, e.currency)}
								</div>
								<div className="col-span-2 text-sm text-gray-300">
									{formatDateTime(e.occurredAt)}
								</div>
							</div>
						))}

						{items.length === 0 && (
							<div className="px-2 py-8 text-center text-gray-400">
								No revenue entries found.
							</div>
						)}
					</div>

					<div className="mt-6 flex items-center justify-between gap-3">
						<div className="text-sm text-gray-400">
							Page <span className="text-white font-medium">{page}</span> of{" "}
							<span className="text-white font-medium">{totalPages}</span>{" "}
							<span className="text-gray-600">•</span>{" "}
							<span className="text-gray-300">{totalItems} entries</span>
						</div>
						<AdminPagination
							page={page}
							totalPages={totalPages}
							onPageChange={(p) => setParams({ page: String(p) })}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-3">
				<p className="text-sm font-medium text-white">Recent subscription changes</p>
				<div className="mt-3 overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="text-xs text-gray-400 border-b border-gray-800">
							<tr>
								<th className="py-2 px-2 font-medium">User</th>
								<th className="py-2 px-2 font-medium">Status</th>
								<th className="py-2 px-2 font-medium">Price</th>
								<th className="py-2 px-2 font-medium">Cancel at period end</th>
								<th className="py-2 px-2 font-medium">Period end</th>
								<th className="py-2 px-2 font-medium">Updated</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-800">
							{pageData.recentSubscriptions.map((s) => (
								<tr key={s.id} className="text-gray-300">
									<td className="py-2.5 px-2 truncate max-w-[240px]" title={s.userEmail}>
										{s.userEmail}
									</td>
									<td className="py-2.5 px-2">{s.status}</td>
									<td className="py-2.5 px-2 truncate max-w-[200px]" title={s.stripePriceId}>
										{s.stripePriceId}
									</td>
									<td className="py-2.5 px-2">{s.cancelAtPeriodEnd ? "Yes" : "No"}</td>
									<td className="py-2.5 px-2">{formatDateTime(s.currentPeriodEnd)}</td>
									<td className="py-2.5 px-2">{formatDateTime(s.updatedAt)}</td>
								</tr>
							))}
							{pageData.recentSubscriptions.length === 0 ? (
								<tr>
									<td className="py-8 px-2 text-center text-gray-400" colSpan={6}>
										No subscription rows yet.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

