import { getCurrentUser } from "@/actions/auth";
import LoginForm from "@/features/auth/components/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const user = await getCurrentUser();

	if (user) redirect("/dashboard");

	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
			<div className="w-full max-w-md">
				<h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
					Welcome Back
				</h1>

				<LoginForm />
			</div>
		</div>
	);
}
