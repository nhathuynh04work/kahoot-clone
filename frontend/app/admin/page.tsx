import type { Metadata } from "next";
import {
	getAdminDashboardStats,
} from "@/features/admin/api/server-actions";
import { AdminDashboardStats } from "@/features/admin/components/admin-dashboard-stats";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";

export const metadata: Metadata = {
	title: "Admin",
};

export default async function AdminOverviewPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};
	const rangeDaysRaw =
		typeof sp.rangeDays === "string" ? parseInt(sp.rangeDays, 10) : NaN;
	const rangeDays =
		Number.isFinite(rangeDaysRaw) && rangeDaysRaw > 0 ? rangeDaysRaw : 30;

	const stats = await getAdminDashboardStats({ rangeDays });

	return (
		<AdminManagementShell
			crumbs={[{ label: "Admin", href: "/admin" }, { label: "Overview" }]}
		>
			<AdminDashboardStats stats={stats} rangeDays={rangeDays} />
		</AdminManagementShell>
	);
}

