import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { appButtonClassName } from "@/components/ui/app-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function LandingTopBar() {
	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shrink-0 sticky top-0 z-50">
			<Link
				href="/"
				className="text-xl font-extrabold shrink-0 tracking-tight"
				aria-label="Home"
			>
				<AppLogo />
			</Link>

			<div className="flex-1 min-w-0" />

			<div className="ml-auto flex items-center gap-2 shrink-0">
				<ThemeToggle compact />
				<Link
					href="/game/join"
					className={appButtonClassName("secondary", "px-4 py-2 no-underline")}
				>
					Play game
				</Link>
				<Link
					href="/auth/register"
					className={appButtonClassName("primary", "px-4 py-2 no-underline")}
				>
					Sign up
				</Link>
			</div>
		</div>
	);
}
