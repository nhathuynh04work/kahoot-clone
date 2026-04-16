"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
	{ label: "7d", days: 7 },
	{ label: "30d", days: 30 },
	{ label: "90d", days: 90 },
	{ label: "365d", days: 365 },
] as const;

export function AdminDashboardRangeSelector({
	rangeDays,
}: {
	rangeDays: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const setRange = (days: number) => {
		const next = new URLSearchParams(searchParams.toString());
		next.set("rangeDays", String(days));
		router.replace(`${pathname}?${next.toString()}`);
	};

	return (
		<div className="inline-flex items-center gap-1 rounded-xl border border-(--app-border) bg-(--app-elevated) p-1 shadow-sm">
			{OPTIONS.map((o) => {
				const active = rangeDays === o.days;
				return (
					<button
						key={o.days}
						type="button"
						onClick={() => setRange(o.days)}
						className={[
							"px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
							active
								? "bg-(--app-control-active-bg) text-(--app-control-active-fg) border border-(--app-control-active-border) shadow-sm ring-1 ring-inset ring-(--app-control-active-border) dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:ring-0 dark:shadow-none"
								: "text-(--app-fg) hover:text-(--app-fg) hover:bg-(--app-control-bg-hover) border border-transparent",
						].join(" ")}
						aria-pressed={active}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
}

