import { cn } from "@/lib/utils";

export interface StatTileProps {
	label: string;
	value: React.ReactNode;
	tone?: "default" | "accent";
}

export function StatTile({
	label,
	value,
	tone = "default",
}: StatTileProps) {
	return (
		<div
			className={cn(
				"rounded-lg border p-3",
				"bg-(--app-surface-muted)/80 border-(--app-border)",
				tone === "accent" && "border-indigo-500/40",
			)}
		>
			<p className="text-(--app-fg-muted) text-xs">{label}</p>
			<p
				className={cn(
					"mt-1 font-semibold text-(--app-fg) tabular-nums",
					tone === "accent" && "text-indigo-300",
				)}
			>
				{value}
			</p>
		</div>
	);
}
