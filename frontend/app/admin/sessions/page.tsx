import type { Metadata } from "next";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminSessionsPage } from "@/features/admin/api/server-actions";
import { AdminSessionManagement } from "@/features/admin/components/admin-session-management";

export const metadata: Metadata = {
	title: "Admin sessions",
};

export default async function AdminSessionsPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};

	const q = typeof sp.q === "string" ? sp.q : undefined;
	const sortParam = typeof sp.sort === "string" ? sp.sort : undefined;
	const sort =
		sortParam === "createdAt_asc"
			? "createdAt_asc"
			: sortParam === "endedAt_desc"
				? "endedAt_desc"
				: "createdAt_desc";

	const statusRaw = typeof sp.status === "string" ? sp.status : undefined;
	const status =
		statusRaw === "CREATED" ||
		statusRaw === "WAITING" ||
		statusRaw === "IN_PROGRESS" ||
		statusRaw === "CLOSED"
			? statusRaw
			: undefined;

	const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

	const pageSizeRaw =
		typeof sp.pageSize === "string" ? parseInt(sp.pageSize, 10) : 50;
	const pageSize = Number.isFinite(pageSizeRaw)
		? Math.min(100, Math.max(1, pageSizeRaw))
		: 50;

	const sessionsPage = await getAdminSessionsPage({
		page,
		pageSize,
		q,
		sort,
		status,
	});

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Sessions" },
			]}
		>
			<AdminSessionManagement pageData={sessionsPage} />
		</AdminManagementShell>
	);
}

