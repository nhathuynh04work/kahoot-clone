import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Admin sign in",
	robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
	const user = await getCurrentUser();

	if (user?.role === "ADMIN") redirect("/admin/dashboard");

	return (
		<>
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
					Admin sign in
				</h1>
				<p className="text-gray-400 text-sm sm:text-base">
					Sign in to access the admin dashboard.
				</p>
			</div>

			<AdminLoginForm />
		</>
	);
}

