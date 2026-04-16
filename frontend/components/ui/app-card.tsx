import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AppCard({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"rounded-xl border border-(--app-border) bg-(--app-card) text-(--app-fg) shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}
