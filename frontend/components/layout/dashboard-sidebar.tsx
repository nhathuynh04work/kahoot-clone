"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/features/auth/types";
import {
	LayoutGrid,
	FileText,
	History,
	Compass,
	LogOut,
	Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";

const navItems = [
	{ href: "/library/quizzes", label: "Quizzes", icon: LayoutGrid },
	{ href: "/library/files", label: "Files", icon: FileText },
	{ href: "/discover", label: "Discover", icon: Compass },
	{ href: "/reports", label: "Reports", icon: History },
	{ href: "/settings/subscription", label: "VIP", icon: Crown },
] as const;

const getInitials = (email: string) => email[0]?.toUpperCase() || "?";

export function DashboardSidebar({ user }: { user: User }) {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<aside className="hidden md:flex w-[76px] shrink-0 border-r border-gray-700 bg-gray-800/50 flex-col sticky top-[58px] z-40 self-stretch">
			<nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1" aria-label="Main navigation">
				{navItems.map(({ href, label, icon: Icon }) => {
					const isActive =
						href === "/library/quizzes"
							? pathname === "/library/quizzes" || pathname.startsWith("/library/quizzes/")
							: pathname.startsWith(href);
					const isVipNav = href === "/settings/subscription";
					const isVipUser = user.vip?.isVip === true;
					const vipMinimal = isVipNav && isVipUser;
					return (
						<Link
							key={href}
							href={href}
							title={
								isVipNav
									? isVipUser
										? "Billing & VIP"
										: "Upgrade to VIP"
									: undefined
							}
							className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors border ${
								isActive
									? "bg-indigo-600/10 text-white border-indigo-500/30 shadow-[0_0_0_1px_rgba(79,70,229,0.15)]"
									: isVipNav && !isVipUser
										? "text-gray-400 border-transparent hover:text-amber-200 hover:bg-amber-500/10 hover:border-amber-500/20"
										: "text-gray-400 border-transparent hover:text-white hover:bg-gray-700/70 hover:border-gray-700"
							}`}
						>
							<Icon className="w-5 h-5 shrink-0" aria-hidden />
							<span className="leading-none">{label}</span>
							{isVipNav && !vipMinimal ? (
								<span className="text-[9px] font-bold leading-none tracking-wide text-gray-600">
									FREE
								</span>
							) : null}
						</Link>
					);
				})}
			</nav>

			<div className="mt-auto p-2 border-t border-gray-700 flex flex-col gap-1">
				<button
					type="button"
					onClick={() => router.push(`/users/${user.id}`)}
					className="w-full flex items-center justify-center p-1.5 hover:bg-gray-700/40 rounded-lg transition-colors"
					aria-label="Go to profile"
				>
					<div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white shrink-0">
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
