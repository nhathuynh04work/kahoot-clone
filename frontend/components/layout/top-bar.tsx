"use client";

import { User } from "@/features/auth/types";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

import { Search, LogOut, Gamepad2 } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";

const getInitials = (email: string) => {
	return email[0]?.toUpperCase() || "?";
};

export default function TopBar({ user }: { user: User }) {
	const [accountOpen, setAccountOpen] = useState(false);
	const accountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
				setAccountOpen(false);
			}
		}
		if (accountOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [accountOpen]);

	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-gray-700 bg-gray-800 text-white shrink-0">
			<Link
				href="/dashboard"
				className="text-xl font-extrabold shrink-0 tracking-tight"
			>
				<span className="text-white">quiztopia</span>
				<span className="text-emerald-400">!</span>
			</Link>

			{/* Search — centered */}
			<div className="flex-1 min-w-0 flex justify-center">
				<div className="w-full max-w-md relative">
					<label htmlFor="topbar-search" className="sr-only">
						Search
					</label>
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
						aria-hidden
					/>
					<input
						id="topbar-search"
						type="search"
						placeholder="Search quizzes, files…"
						className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
						aria-label="Search"
					/>
				</div>
			</div>

			{/* Right: CTA + account */}
			<div className="ml-auto flex items-center gap-2 shrink-0">
				<Link
					href="/"
					className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/10"
					title="Join a game with a PIN"
				>
					<Gamepad2 className="w-4 h-4" aria-hidden />
					Join game
				</Link>

				<div className="relative" ref={accountRef}>
					<button
						type="button"
						onClick={() => setAccountOpen((o) => !o)}
						className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white hover:ring-2 hover:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
						title="Account"
						aria-label="Account menu"
						aria-expanded={accountOpen}
					>
						{getInitials(user.email)}
					</button>

					{accountOpen && (
						<div
							className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-600 bg-gray-800 py-2 shadow-xl z-50"
							role="menu"
						>
							<div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
								<div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm">
									{getInitials(user.email)}
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Account</p>
									<p className="text-sm text-white truncate" title={user.email}>
										{user.email}
									</p>
								</div>
							</div>
							<div className="pt-1">
								<LogoutButton className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer">
									<LogOut className="w-4 h-4 shrink-0" />
									Log out
								</LogoutButton>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
