import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { AdminDashboardSidebar } from "@/components/layout/admin-dashboard-sidebar";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();

	if (!user) redirect("/auth/login");
	if (user.role !== "ADMIN") redirect("/auth/admin-login");

	return (
		<div
			className="h-dvh overflow-hidden bg-gray-950 flex flex-col"
			style={{ ["--app-header-height" as string]: "58px" }}
		>
			<AdminTopBar user={user} />
			<div className="flex flex-1 min-h-0">
				<AdminDashboardSidebar />
				<main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}

