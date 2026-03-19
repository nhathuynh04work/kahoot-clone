import TopBar from "@/components/layout/top-bar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export default async function Layout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	return (
		<div
			className="h-dvh overflow-hidden bg-gray-900 flex flex-col"
			style={{ ["--app-header-height" as string]: "58px" }}
		>
			<TopBar user={user} />
			<div className="flex flex-1 min-h-0">
				<DashboardSidebar />
				<main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
