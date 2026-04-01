"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import { Search, LogOut, Shield } from "lucide-react";
import type { User } from "@/features/auth/types";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { AppLogo } from "@/components/layout/app-logo";

const getInitials = (email: string) => {
	return email[0]?.toUpperCase() || "?";
};

export function AdminTopBar({ user }: { user: User }) {
	const [accountOpen, setAccountOpen] = useState(false);
	const accountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				accountRef.current &&
				!accountRef.current.contains(e.target as Node)
			) {
				setAccountOpen(false);
			}
		}

		if (accountOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [accountOpen]);

	useEffect(() => {
		if (!accountOpen) return;
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setAccountOpen(false);
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [accountOpen]);

	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-gray-800 bg-gray-950 text-white shrink-0 sticky top-0 z-50">
			<Link
				href="/admin/dashboard"
				className="text-xl font-extrabold shrink-0 tracking-tight flex items-center gap-2"
				aria-label="Admin home"
			>
				<AppLogo />
				<Shield className="w-5 h-5 text-emerald-400" aria-hidden />
			</Link>

			{/* Admin search is dashboard-local (not wired yet). Kept only for visual parity. */}
			<div className="flex-1 min-w-0 flex justify-center">
				<div className="w-full max-w-md relative">
					<label htmlFor="admin-topbar-search" className="sr-only">
						Search
					</label>
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
						aria-hidden
					/>
					<input
						id="admin-topbar-search"
						type="search"
						placeholder="Search admin…"
						disabled
						className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-900/60 border border-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none"
						aria-label="Admin search (disabled)"
					/>
				</div>
			</div>

			<div className="ml-auto flex items-center gap-2 shrink-0">
				<div className="relative" ref={accountRef}>
					<button
						type="button"
						onClick={() => setAccountOpen((o) => !o)}
						className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white hover:ring-2 hover:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
						title="Account menu"
						aria-label="Account menu"
						aria-haspopup="menu"
						aria-expanded={accountOpen}
					>
						{getInitials(user.email)}
					</button>

					{accountOpen && (
						<div
							className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-700 bg-gray-950 py-2 shadow-xl z-50"
							role="menu"
						>
							<Link
								href={`/users/${user.id}`}
								onClick={() => setAccountOpen(false)}
								className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-900/60 transition-colors"
							>
								<div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
									{getInitials(user.email)}
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
										Account
									</p>
									<p
										className="text-sm text-white truncate"
										title={user.email}
									>
										{user.email}
									</p>
								</div>
							</Link>

							<div className="pt-1">
								<LogoutButton
									className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-900 hover:text-white transition-colors cursor-pointer"
								>
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

