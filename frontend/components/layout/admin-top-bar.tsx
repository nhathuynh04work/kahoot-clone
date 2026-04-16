"use client";

import Link from "next/link";

import { Search } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";

export function AdminTopBar() {
	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shrink-0 sticky top-0 z-50">
			<Link
				href="/admin"
				className="text-xl font-extrabold shrink-0 tracking-tight flex items-center gap-2"
				aria-label="Admin home"
			>
				<AppLogo />
			</Link>

			{/* Admin search is dashboard-local (not wired yet). Kept only for visual parity. */}
			<div className="flex-1 min-w-0 flex justify-center">
				<div className="w-full max-w-md relative">
					<label htmlFor="admin-topbar-search" className="sr-only">
						Search
					</label>
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--app-fg-muted)"
						aria-hidden
					/>
					<input
						id="admin-topbar-search"
						type="search"
						placeholder="Search admin…"
						disabled
						className="w-full pl-9 pr-4 py-2 rounded-lg bg-(--app-input-bg) border border-(--app-border) text-(--app-fg) placeholder:text-(--app-fg-muted)/50 text-sm focus:outline-none opacity-80"
						aria-label="Admin search (disabled)"
					/>
				</div>
			</div>
		</div>
	);
}

