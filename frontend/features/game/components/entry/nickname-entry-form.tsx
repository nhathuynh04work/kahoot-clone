"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/features/game/lib/socket";

interface NicknameEntryFormProps {
	pin: string;
	quizTitle: string;
}

export function NicknameEntryForm({ pin, quizTitle }: NicknameEntryFormProps) {
	const [nickname, setNickname] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	function handleJoin(e: React.FormEvent) {
		e.preventDefault();
		if (!nickname.trim()) {
			setError("Please enter a nickname.");
			return;
		}

		localStorage.setItem("kahoot-nickname", nickname);

		socket.emit("joinLobby", { pin, nickname }, (response: any) => {
			if (!response.success) {
				setError(response.error || "Failed to join lobby.");
				return;
			}

			router.push(`/game/${pin}`);
		});
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
			<h1 className="text-3xl font-bold mb-2 text-indigo-400 text-center">
				{quizTitle}
			</h1>
			<p className="text-xl text-gray-300 mb-6">Game PIN: {pin}</p>

			<form
				onSubmit={handleJoin}
				className="flex flex-col gap-5 w-full max-w-sm p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
				<input
					type="text"
					placeholder="Enter your nickname"
					value={nickname}
					onChange={(e) => setNickname(e.target.value)}
					maxLength={15}
					className="w-full px-4 py-3 border border-gray-600 rounded-lg text-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition"
					required
				/>
				<button
					type="submit"
					disabled={nickname.trim().length === 0}
					className="w-full py-3 text-white rounded-lg font-bold transition bg-green-600 hover:bg-green-700">
					OK, Go!
				</button>
			</form>
			{error && <p className="mt-4 text-red-400">{error}</p>}
		</div>
	);
}
