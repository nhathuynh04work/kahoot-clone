"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import type { AdminRevenuePageResponse } from "@/features/admin/api/server-actions";
import type {
	AdminRevenueLedgerItem,
	AdminRevenueSubscriptionItem,
} from "@/features/admin/api/server-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminPagination } from "@/features/admin/components/admin-pagination";

function formatDateTime(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleDateString();
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

function truncateId(id: string, keep: number = 12) {
	if (!id) return "—";
	if (id.length <= keep + 1) return id;
	return `${id.slice(0, keep)}…`;
}

function Badge({
	children,
	tone = "neutral",
	title,
}: {
	children: string;
	tone?: "neutral" | "good" | "warn" | "bad";
	title?: string;
}) {
	const cls =
		tone === "good"
			? "bg-emerald-500/10 text-emerald-100 border-emerald-500/30"
			: tone === "warn"
				? "bg-amber-500/10 text-amber-100 border-amber-500/25"
				: tone === "bad"
					? "bg-red-500/10 text-red-100 border-red-500/25"
					: "bg-gray-800/70 text-gray-200 border-gray-700";
	return (
		<span
			title={title}
			className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${cls}`}
		>
			{children}
		</span>
	);
}

function toneForSubscriptionStatus(status: string | null | undefined) {
	const s = (status ?? "").toLowerCase();
	if (s === "active" || s === "trialing") return "good";
	if (s === "past_due" || s === "paused") return "warn";
	if (s === "canceled" || s === "unpaid" || s === "incomplete_expired") return "bad";
	return "neutral";
}

type RevenueTab = "purchases" | "subscriptions";

export function AdminRevenueManagement({
	pageData,
}: {
	pageData: AdminRevenuePageResponse;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlTab = (searchParams.get("tab") ?? "purchases") as RevenueTab;
	const activeTab: RevenueTab =
		urlTab === "subscriptions" ? urlTab : "purchases";

	const setParams = (patch: Record<string, string | undefined>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (!v) next.delete(k);
			else next.set(k, v);
		}
		router.replace(`${pathname}?${next.toString()}`);
	};

	const { items, page, totalPages, totalItems } = pageData.ledger;

	const tabs = useMemo(
		() => [
			{ id: "purchases" as const, label: "Purchases" },
			{ id: "subscriptions" as const, label: "Subscriptions" },
		],
		[],
	);

	const purchasesColumns = useMemo(() => {
		return [
			{
				accessorKey: "stripeInvoiceId",
				header: "Invoice",
				meta: { widthClassName: "w-[520px]" },
				cell: ({ row }: { row: { original: AdminRevenueLedgerItem } }) => {
					const inv = row.original.stripeInvoiceId;
					const currency = row.original.currency?.toUpperCase() ?? "USD";
					return (
						<div className="min-w-0">
							<div className="flex items-center gap-2 min-w-0">
								<Badge tone="neutral" title="Stripe invoice id">
									Stripe
								</Badge>
								<Badge tone="neutral" title="Currency">
									{currency}
								</Badge>
								<span
									className="text-sm font-semibold text-white truncate"
									title={inv}
								>
									{inv === "—" ? "—" : truncateId(inv, 18)}
								</span>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "userEmail",
				header: "User",
				meta: { widthClassName: "w-[280px]" },
				cell: ({ row }: { row: { original: AdminRevenueLedgerItem } }) => (
					<span
						className="text-sm text-gray-300 truncate block"
						title={row.original.userEmail ?? undefined}
					>
						{row.original.userEmail ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "amountCents",
				header: "Amount",
				meta: { widthClassName: "w-[160px]" },
				cell: ({ row }: { row: { original: AdminRevenueLedgerItem } }) => (
					<span className="text-sm text-gray-300 tabular-nums">
						{formatMoney(row.original.amountCents, row.original.currency)}
					</span>
				),
			},
			{
				accessorKey: "occurredAt",
				header: "Occurred",
				meta: { widthClassName: "w-[220px]" },
				cell: ({ row }: { row: { original: AdminRevenueLedgerItem } }) => (
					<span className="text-sm text-gray-300 whitespace-nowrap">
						{formatDateTime(row.original.occurredAt)}
					</span>
				),
			},
		];
	}, []);

	const subscriptionColumns = useMemo(() => {
		return [
			{
				accessorKey: "userEmail",
				header: "User",
				meta: { widthClassName: "w-[320px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<span className="text-sm font-semibold text-white truncate block" title={row.original.userEmail}>
						{row.original.userEmail}
					</span>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				meta: { widthClassName: "w-[160px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<Badge tone={toneForSubscriptionStatus(row.original.status)}>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "cancelAtPeriodEnd",
				header: "Cancel",
				meta: { widthClassName: "w-[140px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<Badge tone={row.original.cancelAtPeriodEnd ? "warn" : "neutral"}>
						{row.original.cancelAtPeriodEnd ? "Scheduled" : "No"}
					</Badge>
				),
			},
			{
				accessorKey: "currentPeriodEnd",
				header: "Period end",
				meta: { widthClassName: "w-[160px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<span className="text-sm text-gray-300 whitespace-nowrap">
						{formatDate(row.original.currentPeriodEnd)}
					</span>
				),
			},
			{
				accessorKey: "updatedAt",
				header: "Updated",
				meta: { widthClassName: "w-[220px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<span className="text-sm text-gray-300 whitespace-nowrap">
						{formatDateTime(row.original.updatedAt)}
					</span>
				),
			},
		];
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SegmentedTabs
					tabs={tabs}
					activeId={activeTab}
					onChange={(id) => {
						setParams({ tab: id, page: id === "purchases" ? (searchParams.get("page") ?? "1") : "1" });
					}}
				/>
			</div>

			{activeTab === "purchases" ? (
				<div className="mt-2">
					<AdminDataTable
						data={items}
						columns={purchasesColumns as any}
						emptyText="No purchases found."
					/>

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
			) : (
				<div className="mt-2">
					<AdminDataTable
						data={pageData.recentSubscriptions}
						columns={subscriptionColumns as any}
						emptyText="No subscriptions found."
					/>
				</div>
			)}
		</div>
	);
}

