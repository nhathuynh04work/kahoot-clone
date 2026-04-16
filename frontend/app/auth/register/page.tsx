import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Create account",
	description:
		"Create a free Quiztopia account to build quizzes, host sessions with a PIN, and track results.",
};

export default async function RegisterPage() {
	const user = await getCurrentUser();
	if (user) redirect(user.role === "ADMIN" ? "/admin" : "/library/quizzes");

	return (
		<>
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-black text-(--app-fg) mb-2 tracking-tight">
					Create your account
				</h1>
				<p className="text-(--app-fg-muted) text-sm sm:text-base">
					Start creating quizzes and hosting games in minutes.
				</p>
			</div>

			<RegisterForm />
		</>
	);
}
