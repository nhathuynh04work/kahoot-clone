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
		<div className="inline-flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/40 p-1">
			{OPTIONS.map((o) => {
				const active = rangeDays === o.days;
				return (
					<button
						key={o.days}
						type="button"
						onClick={() => setRange(o.days)}
						className={[
							"px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
							active
								? "bg-emerald-500/15 text-emerald-100 border border-emerald-500/30"
								: "text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent",
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

