import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
			<div className="w-full max-w-md">
				<h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
					Create Your Account
				</h1>

				<RegisterForm />
			</div>
		</div>
	);
}
