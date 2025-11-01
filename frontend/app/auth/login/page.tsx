import LoginForm from "@/components/auth/login-form";

export default async function LoginPage() {
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
