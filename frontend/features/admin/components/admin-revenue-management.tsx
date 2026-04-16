"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Badge } from "@/components/ui/badge";
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

type BadgeTone = "neutral" | "good" | "warn" | "bad";

function toneForSubscriptionStatus(status: string | null | undefined): BadgeTone {
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
									className="text-sm font-semibold text-(--app-fg) truncate"
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
						className="text-sm text-(--app-fg-muted) truncate block"
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
					<span className="text-sm text-(--app-fg-muted) tabular-nums">
						{formatMoney(row.original.amountCents, row.original.currency)}
					</span>
				),
			},
			{
				accessorKey: "occurredAt",
				header: "Occurred",
				meta: { widthClassName: "w-[220px]" },
				cell: ({ row }: { row: { original: AdminRevenueLedgerItem } }) => (
					<span className="text-sm text-(--app-fg-muted) whitespace-nowrap">
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
					<span className="text-sm font-semibold text-(--app-fg) truncate block" title={row.original.userEmail}>
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
					<span className="text-sm text-(--app-fg-muted) whitespace-nowrap">
						{formatDate(row.original.currentPeriodEnd)}
					</span>
				),
			},
			{
				accessorKey: "updatedAt",
				header: "Updated",
				meta: { widthClassName: "w-[220px]" },
				cell: ({ row }: { row: { original: AdminRevenueSubscriptionItem } }) => (
					<span className="text-sm text-(--app-fg-muted) whitespace-nowrap">
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
						<div className="text-sm text-(--app-fg-muted)">
							Page <span className="text-(--app-fg) font-medium">{page}</span> of{" "}
							<span className="text-(--app-fg) font-medium">{totalPages}</span>{" "}
							<span className="text-(--app-fg-muted)/60">•</span>{" "}
							<span className="text-(--app-fg-muted)">{totalItems} entries</span>
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

