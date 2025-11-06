
import { PinEntryForm } from "@/components/game/pin-entry-form";
import Link from "next/link";

export default async function Home() {
	return (
		<div className="bg-gray-900">
			<div className="flex flex-col items-center justify-center min-h-screen text-white">
				<h1 className="text-5xl font-bold mb-4">Kahoot!</h1>

				<p className="text-xl text-gray-300 mb-10">
					Your new favorite quiz platform.
				</p>

				{/* --- Game PIN Entry Form (Dark Card) --- */}
				<PinEntryForm />

				{/* --- Login/Register Links --- */}
				<div className="flex gap-4">
					<Link
						href="/auth/login"
						className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm">
						Host/Login
					</Link>
					<Link
						href="/auth/register"
						className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition shadow-sm border border-gray-600">
						Register
					</Link>
				</div>
			</div>
		</div>
	);
}
