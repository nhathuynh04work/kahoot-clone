import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";

export function LandingTopBar() {
	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-gray-700 bg-gray-800 text-white shrink-0 sticky top-0 z-50">
			<Link
				href="/"
				className="text-xl font-extrabold shrink-0 tracking-tight"
				aria-label="Home"
			>
				<AppLogo />
			</Link>

			<div className="flex-1 min-w-0" />

			<div className="ml-auto flex items-center gap-2 shrink-0">
				<Link
					href="/game/join"
					className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-900/20 hover:bg-gray-900/40 text-white font-semibold text-sm transition-colors"
				>
					Play game
				</Link>
				<Link
					href="/auth/register"
					className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
				>
					Sign up
				</Link>
			</div>
		</div>
	);
}
