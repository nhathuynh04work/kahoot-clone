import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "./actions/auth";

export default async function Home() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
			<h1 className="text-5xl font-bold mb-4">Welcome to Kahootz!</h1>
			<p className="text-xl text-gray-700 mb-8">
				Your new favorite quiz platform.
			</p>
			<div className="flex gap-4">
				<Link
					href="/auth/login"
					className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
					Login
				</Link>
				<Link
					href="/auth/register"
					className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
					Register
				</Link>
			</div>
		</div>
	);
}
