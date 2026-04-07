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

	const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

	const revenuePage = await getAdminRevenuePage({ page, pageSize: 50 });

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

