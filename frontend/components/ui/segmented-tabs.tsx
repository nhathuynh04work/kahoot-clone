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
				"max-w-full overflow-x-auto inline-flex rounded-xl border border-gray-700 bg-gray-900/40",
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
							"relative min-w-[72px] sm:min-w-[88px] px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center whitespace-nowrap",
							idx !== 0 && "border-l border-gray-700",
							isFirst && "rounded-l-xl",
							isLast && "rounded-r-xl",
							stretch && "flex-1 min-w-0",
							isActive
								? "bg-indigo-600/20 text-indigo-200 ring-1 ring-inset ring-indigo-500/70 z-10"
								: "text-gray-300 hover:bg-gray-800/60 hover:text-white",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

