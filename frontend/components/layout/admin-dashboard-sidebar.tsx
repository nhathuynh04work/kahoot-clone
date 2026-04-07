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
		<aside className="w-[76px] shrink-0 border-r border-gray-800 bg-gray-950/40 flex flex-col sticky top-0 z-40 self-stretch">
			<div className="h-[58px] shrink-0 flex items-center justify-center border-b border-gray-800">
				<Link
					href="/admin"
					aria-label="Admin home"
					title="Admin dashboard"
					className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-900/60 transition-colors"
				>
					<AppLogo variant="mark" className="text-white" />
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
									? "bg-emerald-500/10 text-white border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
									: "text-gray-400 border-transparent hover:text-white hover:bg-gray-900/60 hover:border-gray-800"
							}`}
						>
							<Icon
								className="w-5 h-5 shrink-0 text-emerald-400"
								aria-hidden
							/>
							<span className="leading-[1.05] text-center">{label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="mt-auto p-2 border-t border-gray-800 flex flex-col gap-1">
				<button
					type="button"
					onClick={() => router.push(`/users/${user.id}`)}
					className="w-full flex items-center justify-center p-1.5 hover:bg-gray-900/60 rounded-lg transition-colors"
					aria-label="Go to profile"
				>
					<div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white shrink-0">
						{getInitials(user.email)}
					</div>
				</button>

				<LogoutButton
					aria-label="Log out"
					className="w-full flex items-center justify-center p-2 rounded-lg bg-transparent text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
				>
					<LogOut className="w-4 h-4 shrink-0" aria-hidden />
					<span className="sr-only">Log out</span>
				</LogoutButton>
			</div>
		</aside>
	);
}

