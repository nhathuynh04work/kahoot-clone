import { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardSidebar } from "@/components/layout/admin-dashboard-sidebar";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();

	if (!user) redirect("/auth/login");
	if (user.role !== "ADMIN") redirect("/auth/admin-login");

	return (
		<div
			className="admin-contrast fixed inset-0 overflow-hidden bg-(--app-bg) text-(--app-fg) flex flex-col"
		>
			<div className="flex flex-1 min-h-0">
				<AdminDashboardSidebar user={user} />
				<main className="flex-1 min-w-0 min-h-0 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}

