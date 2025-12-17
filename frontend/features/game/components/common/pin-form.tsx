"use client";

import { FormEvent, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { getValidLobby } from "../../api/server-actions";
import { toast } from "sonner";

interface PinFormProps {
	onSuccess: (pin: string) => void;
}

export function PinForm({ onSuccess }: PinFormProps) {
	const [pin, setPin] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleJoinGame(e: FormEvent) {
		e.preventDefault();
		if (!pin) {
			toast.error("Please enter game PIN.");
			return;
		}

		setIsLoading(true);

		try {
			const lobby = await getValidLobby(pin);
			onSuccess(lobby.pin);
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
			<form
				onSubmit={handleJoinGame}
				className="flex flex-col gap-6 p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-white">Join Game</h2>
					<p className="text-gray-400 text-sm mt-1">
						Enter the PIN on the host screen
					</p>
				</div>

				<input
					type="text"
					inputMode="numeric"
					placeholder="Game PIN"
					value={pin}
					onChange={(e) => setPin(e.target.value)}
					className="w-full px-4 py-4 text-center text-3xl font-black tracking-widest bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
					autoFocus
				/>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 disabled:cursor-not-allowed text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
					{isLoading ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Checking...
						</>
					) : (
						<>
							Enter <ArrowRight size={20} />
						</>
					)}
				</button>
			</form>
		</div>
	);
}
