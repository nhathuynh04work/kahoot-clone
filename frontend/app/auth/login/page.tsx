import { getCurrentUser } from "@/features/auth/api/server-actions";
import LoginForm from "@/features/auth/components/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const user = await getCurrentUser();

	if (user) redirect("/dashboard");

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 transition-colors">
			<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
						Welcome Back
					</h1>
					<p className="text-gray-400 text-lg">
						Sign in to continue to your dashboard
					</p>
				</div>

				<LoginForm />
			</div>
		</div>
	);
}
