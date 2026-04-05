import type { Metadata } from "next";
import {
	getAdminDashboardStats,
} from "@/features/admin/api/server-actions";
import { AdminDashboardStats } from "@/features/admin/components/admin-dashboard-stats";

export const metadata: Metadata = {
	title: "Admin dashboard",
};

export default async function AdminDashboardPage() {
	const stats = await getAdminDashboardStats();

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<AdminDashboardStats stats={stats} />
			</div>
		</div>
	);
}

