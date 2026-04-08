"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/features/auth/types";
import { LayoutGrid, FileText, History, Compass, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/library/quizzes", label: "Quizzes", icon: LayoutGrid },
	{ href: "/library/files", label: "Files", icon: FileText },
	{ href: "/discover", label: "Discover", icon: Compass },
	{ href: "/reports", label: "Reports", icon: History },
	{ href: "/settings/subscription", label: "VIP", icon: Crown },
] as const;

export function MobileNav({ user }: { user: User }) {
	const pathname = usePathname();

	return (
		<nav
			className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-700 bg-gray-900/90 backdrop-blur"
			aria-label="Primary navigation"
		>
			<div className="mx-auto w-full max-w-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
				<div className="grid grid-cols-5 gap-1">
					{navItems.map(({ href, label, icon: Icon }) => {
						const isActive =
							href === "/library/quizzes"
								? pathname === "/library/quizzes" ||
									pathname.startsWith("/library/quizzes/")
								: pathname.startsWith(href);

						const isVipNav = href === "/settings/subscription";
						const isVipUser = user.vip?.isVip === true;

						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors",
									isActive
										? "text-white bg-indigo-600/15"
										: isVipNav && !isVipUser
											? "text-amber-200/80 hover:text-amber-200 hover:bg-amber-500/10"
											: "text-gray-300/80 hover:text-white hover:bg-gray-800/70",
								)}
							>
								<Icon className="h-5 w-5" aria-hidden />
								<span className="leading-none">{label}</span>
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}

