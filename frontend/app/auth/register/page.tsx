import RegisterForm from "@/features/auth/components/register-form";

export default function RegisterPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 transition-colors">
			<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
						Create Account
					</h1>
					<p className="text-gray-400 text-lg">
						Join us to create and play amazing quizzes
					</p>
				</div>

				<RegisterForm />
			</div>
		</div>
	);
}
