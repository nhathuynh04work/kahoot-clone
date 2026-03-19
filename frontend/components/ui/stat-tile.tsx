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
				"bg-gray-900/40 border-gray-700",
				tone === "accent" && "border-indigo-500/40",
			)}
		>
			<p className="text-gray-400 text-xs">{label}</p>
			<p
				className={cn(
					"mt-1 font-semibold text-white tabular-nums",
					tone === "accent" && "text-indigo-300",
				)}
			>
				{value}
			</p>
		</div>
	);
}
