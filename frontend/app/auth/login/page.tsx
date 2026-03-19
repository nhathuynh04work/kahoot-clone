import { getCurrentUser } from "@/features/auth/api/server-actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const user = await getCurrentUser();

	if (user) redirect("/dashboard");

	return (
		<>
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
					Welcome back
				</h1>
				<p className="text-gray-400 text-sm sm:text-base">
					Sign in to continue to your dashboard.
				</p>
			</div>

			<LoginForm />
		</>
	);
}
