import type { Metadata } from "next";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminRevenuePage } from "@/features/admin/api/server-actions";
import { AdminRevenueManagement } from "@/features/admin/components/admin-revenue-management";

export const metadata: Metadata = {
	title: "Admin revenue",
};

export default async function AdminRevenuePage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};
	const q = typeof sp.q === "string" ? sp.q : undefined;

	const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

	const pageSizeRaw =
		typeof sp.pageSize === "string" ? parseInt(sp.pageSize, 10) : 50;
	const pageSize = Number.isFinite(pageSizeRaw)
		? Math.min(100, Math.max(1, pageSizeRaw))
		: 50;

	const revenuePage = await getAdminRevenuePage({ page, pageSize, q });

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Revenue" },
			]}
		>
			<AdminRevenueManagement pageData={revenuePage} />
		</AdminManagementShell>
	);
}

