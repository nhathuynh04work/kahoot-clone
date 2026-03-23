"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users } from "lucide-react";

const navItems = [
	{ href: "/admin/dashboard", label: "Overview", icon: BarChart3 },
	{ href: "/admin/dashboard/users", label: "User management", icon: Users },
] as const;

export function AdminDashboardSidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-950/40 flex flex-col sticky top-[58px] z-40 self-stretch">
			<nav
				className="flex-1 overflow-y-auto p-3 flex flex-col gap-1"
				aria-label="Admin navigation"
			>
				{navItems.map(({ href, label, icon: Icon }) => {
					const isActive = pathname === href;

					return (
						<Link
							key={href}
							href={href}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
								isActive
									? "bg-emerald-500/10 text-white border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
									: "text-gray-400 border-transparent hover:text-white hover:bg-gray-900/60 hover:border-gray-800"
							}`}
						>
							<Icon className="w-5 h-5 shrink-0 text-emerald-400" aria-hidden />
							{label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}

