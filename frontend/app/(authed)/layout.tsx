import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import TopBar from "@/components/layout/top-bar";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default async function AuthedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const user = await getCurrentUser();

	if (!user) redirect("/auth/login");
	if (user.role === "ADMIN") redirect("/admin");

	return (
		<div
			className="fixed inset-0 overflow-hidden bg-(--app-bg) text-(--app-fg) flex flex-col"
			style={{ ["--app-header-height" as string]: "58px" }}
		>
			<TopBar user={user} />
			<div className="flex flex-1 min-h-0">
				<DashboardSidebar user={user} />
				<main className="flex-1 min-w-0 min-h-0 overflow-y-auto pb-20 md:pb-0">
					{children}
				</main>
			</div>
			<MobileNav user={user} />
		</div>
	);
}

