"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
	className,
	compact = false,
}: {
	className?: string;
	compact?: boolean;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			className={cn(
				"flex items-center justify-center rounded-lg transition-colors",
				compact
					? "size-10 shrink-0 border border-(--app-border) bg-(--app-surface) hover:bg-(--app-surface-muted)"
					: "w-full p-2 border border-transparent hover:bg-(--app-surface-muted)",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--app-accent) focus-visible:ring-offset-2",
				"focus-visible:ring-offset-(--app-surface)",
				className,
			)}
		>
			{isDark ? (
				<Sun className="w-4 h-4 text-(--app-fg-muted)" aria-hidden />
			) : (
				<Moon className="w-4 h-4 text-(--app-fg-muted)" aria-hidden />
			)}
			<span className="sr-only">{isDark ? "Light mode" : "Dark mode"}</span>
		</button>
	);
}

