import type { Metadata } from "next";
import {
	getAdminUsersPage,
} from "@/features/admin/api/server-actions";
import { AdminUserManagement } from "@/features/admin/components/admin-user-management";

export const metadata: Metadata = {
	title: "Users",
};

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};

	const q = typeof sp.q === "string" ? sp.q : undefined;

	const sortParam = typeof sp.sort === "string" ? sp.sort : undefined;
	const sort =
		sortParam === "createdAt_asc" ? "createdAt_asc" : "createdAt_desc";

	const pageRaw = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
	const page =
		Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

	const pageSizeRaw =
		typeof sp.pageSize === "string" ? parseInt(sp.pageSize, 10) : 50;
	const pageSize = Number.isFinite(pageSizeRaw)
		? Math.min(100, Math.max(1, pageSizeRaw))
		: 50;

	const usersPage = await getAdminUsersPage({ page, pageSize, q, sort });

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
						User management
					</h1>
					<p className="text-gray-400 text-sm">
						Manage roles and block/unblock accounts.
					</p>
				</div>

				<AdminUserManagement pageData={usersPage} />
			</div>
		</div>
	);
}

