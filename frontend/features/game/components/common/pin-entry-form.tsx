"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getValidLobby } from "../../api/server-actions";
import { toast } from "sonner";

export function PinEntryForm() {
	const [pin, setPin] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleJoinGame(e: FormEvent) {
		e.preventDefault();
		if (!pin) {
			toast.error("Please enter game PIN.");
			return;
		}

		setIsLoading(true);

		try {
			const lobby = await getValidLobby(pin);
			router.push(`/join?pin=${lobby.pin}`);
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-sm">
			<form
				onSubmit={handleJoinGame}
				className="relative flex flex-col gap-4 p-8 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800">
				<input
					type="text"
					inputMode="numeric"
					placeholder="Game PIN"
					value={pin}
					onChange={(e) => setPin(e.target.value)}
					className="w-full px-4 py-4 text-center text-xl font-bold border-2 border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
					autoFocus
				/>

				<button
					type="submit"
					disabled={isLoading}
					className={`
                        w-full py-4 rounded-lg font-bold text-lg transition-all transform duration-200
                        flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1text-white cursor-pointer`}>
					{isLoading ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Entering...
						</>
					) : (
						"Enter"
					)}
				</button>
			</form>
		</div>
	);
}
