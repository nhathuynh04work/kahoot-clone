import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "info" | "good" | "warn" | "bad";

export function Badge({
	children,
	tone = "neutral",
	className,
	title,
}: {
	children: React.ReactNode;
	tone?: BadgeTone;
	className?: string;
	title?: string;
}) {
	const toneClass =
		tone === "good"
			? "bg-emerald-100 text-slate-950 border-emerald-200 ring-1 ring-inset ring-emerald-900/10 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30 dark:ring-0"
			: tone === "warn"
				? "bg-amber-100 text-slate-950 border-amber-200 ring-1 ring-inset ring-amber-900/10 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/25 dark:ring-0"
				: tone === "bad"
					? "bg-red-100 text-slate-950 border-red-200 ring-1 ring-inset ring-red-900/10 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/25 dark:ring-0"
					: tone === "info"
						? "bg-indigo-100 text-slate-950 border-indigo-200 ring-1 ring-inset ring-indigo-900/10 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30 dark:ring-0"
						: "bg-(--app-elevated) text-(--app-fg) border-(--app-border) ring-1 ring-inset ring-(--app-border)/50 dark:text-(--app-fg) dark:ring-0";

	return (
		<span
			title={title}
			className={cn(
				"inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold tracking-wide whitespace-nowrap",
				toneClass,
				className,
			)}
		>
			{children}
		</span>
	);
}

