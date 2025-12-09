"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PinEntryForm() {
	const [pin, setPin] = useState("");
	const router = useRouter();

	function handleJoinGame(e: React.FormEvent) {
		e.preventDefault();
		if (pin.length > 0) {
			router.push(`/join?pin=${pin}`);
		}
	}

	return (
		<form
			onSubmit={handleJoinGame}
			className="flex flex-col gap-5 w-96 mb-8 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
			<input
				type="text"
				placeholder="Enter Game PIN"
				value={pin}
				onChange={(e) => setPin(e.target.value)}
				maxLength={6}
				className="w-full px-4 py-3 border border-gray-600 rounded-lg text-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition"
				required
			/>

			<button
				type="submit"
				disabled={pin.length === 0}
				className={`w-full py-3 text-white rounded-lg font-bold transition ${
					pin.length > 0
						? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/50"
						: "bg-gray-600 cursor-not-allowed text-gray-400"
				}`}>
				Join Game
			</button>
		</form>
	);
}
