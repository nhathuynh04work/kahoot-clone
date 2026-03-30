import { ReactNode } from "react";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import TopBar from "@/components/layout/top-bar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function PublicLayout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();
	const showSidebar = !!user;

	return (
		<div
			className="h-dvh overflow-hidden bg-gray-900 text-white flex flex-col"
			style={{ ["--app-header-height" as string]: "58px" }}
		>
			<TopBar user={user} />
			<div className="flex flex-1 min-h-0">
				{showSidebar && <DashboardSidebar />}
				<main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}

