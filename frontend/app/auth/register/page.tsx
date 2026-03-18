import RegisterForm from "@/features/auth/components/register-form";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
	const user = await getCurrentUser();
	if (user) redirect("/dashboard");

	return (
		<>
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
					Create your account
				</h1>
				<p className="text-gray-400 text-sm sm:text-base">
					Start creating quizzes and hosting games in minutes.
				</p>
			</div>

			<RegisterForm />
		</>
	);
}
