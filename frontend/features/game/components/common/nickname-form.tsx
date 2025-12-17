"use client";

import { FormEvent, useState } from "react";
import { Loader2, User } from "lucide-react";
import { registerPlayer } from "../../api/server-actions";
import { toast } from "sonner";

interface NicknameFormProps {
	pin: string;
	onSuccess: (nickname: string) => void;
}

export function NicknameForm({ onSuccess, pin }: NicknameFormProps) {
	const [nickname, setNickname] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleJoinGame(e: FormEvent) {
		e.preventDefault();
		if (!nickname) {
			toast.error("Please enter nickname.");
			return;
		}

		setIsLoading(true);

		try {
			await registerPlayer(nickname, pin);
			onSuccess(nickname);
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-sm animate-in slide-in-from-right-8 duration-500">
			<form
				onSubmit={handleJoinGame}
				className="flex flex-col gap-6 p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-white">
						Who are you?
					</h2>
					<p className="text-gray-400 text-sm mt-1">
						Pick a fun nickname
					</p>
				</div>

				<div className="relative">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
						<User size={24} />
					</div>
					<input
						type="text"
						placeholder="Nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						className="w-full pl-12 pr-4 py-4 text-xl font-bold bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
						autoFocus
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 disabled:cursor-not-allowed text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
					{isLoading ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Joining...
						</>
					) : (
						"OK, go!"
					)}
				</button>
			</form>
		</div>
	);
}
