"use client";

import { FormEvent, useState } from "react";
import { Loader2, User } from "lucide-react";
import { registerPlayer } from "@/features/game/api/server-actions";
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
				className="flex flex-col gap-6 p-8 bg-(--app-elevated) rounded-3xl shadow-xl border-2 border-(--app-border)">
				<div className="relative text-center">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--app-fg-muted)">
						<User size={20} />
					</div>
					<input
						type="text"
						placeholder="Nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						className="w-full pl-12 pr-4 py-4 text-xl font-black bg-(--app-input-bg) border-2 border-(--app-border) rounded-2xl text-(--app-fg) placeholder:text-(--app-fg-muted)/50 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
						autoFocus
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-5 rounded-2xl font-black text-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-(--app-surface-muted) disabled:text-(--app-fg-muted) disabled:cursor-not-allowed text-white transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-md"
				>
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
