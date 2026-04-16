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
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
		<aside
			className="hidden md:flex w-[76px] shrink-0 border-r border-(--app-border) bg-(--app-surface) flex-col sticky z-40"
			style={{
				top: "var(--app-header-height)",
				height: "calc(100dvh - var(--app-header-height))",
			}}
		>
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
									? "bg-indigo-600/10 text-(--app-fg) border-indigo-500/30 shadow-[0_0_0_1px_rgba(79,70,229,0.15)]"
									: isVipNav && !isVipUser
										? "text-(--app-fg-muted) border-transparent hover:text-amber-700 hover:bg-amber-500/10 hover:border-amber-500/20"
										: "text-(--app-fg-muted) border-transparent hover:text-(--app-fg) hover:bg-(--app-surface-muted) hover:border-(--app-border)"
							}`}
						>
							<Icon className="w-5 h-5 shrink-0" aria-hidden />
							<span className="leading-none">{label}</span>
							{isVipNav && !vipMinimal ? (
								<span className="text-[9px] font-bold leading-none tracking-wide text-(--app-fg-muted)/60">
									FREE
								</span>
							) : null}
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
