"use client";

import { cn } from "@/lib/utils";

export interface SegmentedTab<T extends string> {
	id: T;
	label: string;
}

export function SegmentedTabs<T extends string>({
	tabs,
	activeId,
	onChange,
	className,
	stretch = false,
}: {
	tabs: Array<SegmentedTab<T>>;
	activeId: T;
	onChange: (id: T) => void;
	className?: string;
	stretch?: boolean;
}) {
	return (
		<div
			className={cn(
				"max-w-full overflow-x-auto inline-flex rounded-xl border border-(--app-border) bg-(--app-elevated) shadow-sm",
				stretch && "flex w-full",
				className,
			)}
			role="tablist"
			aria-label="Tabs"
		>
			{tabs.map((tab, idx) => {
				const isActive = tab.id === activeId;
				const isFirst = idx === 0;
				const isLast = idx === tabs.length - 1;
				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(tab.id)}
						className={cn(
							"relative min-w-[72px] sm:min-w-[88px] px-3 py-2 text-sm font-bold transition-colors flex items-center justify-center whitespace-nowrap",
							idx !== 0 && "border-l border-(--app-border)",
							isFirst && "rounded-l-xl",
							isLast && "rounded-r-xl",
							stretch && "flex-1 min-w-0",
							isActive
								? "bg-(--app-control-active-bg) text-(--app-control-active-fg) ring-1 ring-inset ring-(--app-control-active-border) shadow-sm z-10 dark:bg-(--app-surface) dark:text-(--app-fg) dark:ring-1 dark:ring-inset dark:ring-indigo-500/30"
								: "bg-transparent text-(--app-fg) hover:bg-(--app-control-bg-hover) hover:text-(--app-fg)",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--app-ring)/70 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-surface)",
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

