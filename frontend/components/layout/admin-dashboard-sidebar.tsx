"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	BarChart3,
	Users,
	LogOut,
	LayoutGrid,
	FileText,
	Radio,
	DollarSign,
} from "lucide-react";
import type { User } from "@/features/auth/types";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { AppLogo } from "@/components/layout/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
	{ href: "/admin", label: "Overview", icon: BarChart3 },
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/quizzes", label: "Quizzes", icon: LayoutGrid },
	{ href: "/admin/documents", label: "Docs", icon: FileText },
	{ href: "/admin/sessions", label: "Sessions", icon: Radio },
	{ href: "/admin/revenue", label: "Revenue", icon: DollarSign },
] as const;

const getInitials = (email: string) => email[0]?.toUpperCase() || "?";

export function AdminDashboardSidebar({ user }: { user: User }) {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<aside className="w-[76px] shrink-0 border-r border-(--app-border) bg-(--app-surface) flex flex-col sticky top-0 z-40 h-dvh">
			<div className="h-[58px] shrink-0 flex items-center justify-center border-b border-(--app-border)">
				<Link
					href="/admin"
					aria-label="Admin home"
					title="Admin dashboard"
					className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-(--app-surface-muted) transition-colors"
				>
					<AppLogo variant="mark" className="text-(--app-fg)" />
				</Link>
			</div>
			<nav
				className="flex-1 overflow-y-auto p-2 flex flex-col gap-1"
				aria-label="Admin navigation"
			>
				{navItems.map(({ href, label, icon: Icon }) => {
					const isActive = pathname === href;

					return (
						<Link
							key={href}
							href={href}
							title={label}
							className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11px] font-medium transition-colors border ${
								isActive
									? "bg-emerald-600/15 text-(--app-fg) border-emerald-600/35 shadow-[0_0_0_1px_rgba(16,185,129,0.18)] dark:bg-emerald-500/10 dark:border-emerald-500/30"
									: "text-(--app-fg-muted) border-transparent hover:text-(--app-fg) hover:bg-(--app-surface-muted) hover:border-(--app-border)"
							}`}
						>
							<Icon
								className="w-5 h-5 shrink-0 text-emerald-700 dark:text-emerald-400"
								aria-hidden
							/>
							<span className="leading-[1.05] text-center">{label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="mt-auto">
				<div className="p-2">
					<div className="flex justify-center">
						<ThemeToggle
							compact
							className="border-transparent bg-transparent shadow-none hover:bg-(--app-surface-muted)"
						/>
					</div>
				</div>

				<div className="p-2 border-t border-(--app-border) flex flex-col gap-1">
					<button
						type="button"
						onClick={() => router.push(`/users/${user.id}`)}
						className="w-full flex items-center justify-center p-1.5 hover:bg-(--app-surface-muted) rounded-lg transition-colors"
						aria-label="Go to profile"
					>
						<div className="w-9 h-9 rounded-full bg-(--app-surface-muted) flex items-center justify-center font-bold text-(--app-fg) shrink-0">
							{getInitials(user.email)}
						</div>
					</button>

					<LogoutButton
						aria-label="Log out"
						className="w-full flex items-center justify-center p-2 rounded-lg bg-transparent text-(--app-fg-muted) hover:text-red-500 transition-colors cursor-pointer"
					>
						<LogOut className="w-4 h-4 shrink-0" aria-hidden />
						<span className="sr-only">Log out</span>
					</LogoutButton>
				</div>
			</div>
		</aside>
	);
}

