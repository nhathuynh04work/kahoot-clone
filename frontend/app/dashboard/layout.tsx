import TopBar from "@/components/layout/top-bar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export default async function Layout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	return (
		<div className="min-h-screen bg-gray-900">
			<TopBar user={user} />
			<main>{children}</main>
		</div>
	);
}
