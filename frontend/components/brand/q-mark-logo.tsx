import { cn } from "@/lib/utils";

export function QMarkLogo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 52 30"
			className={cn("h-[1.05em] w-[1.8em] shrink-0 overflow-visible", className)}
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<text
				x="50%"
				y="23"
				fontFamily="Montserrat, Helvetica, sans-serif"
				fontWeight="900"
				fontSize="24"
				textAnchor="middle"
				dominantBaseline="alphabetic"
			>
				<tspan fill="currentColor">q</tspan>
				<tspan fill="var(--app-accent)">!</tspan>
			</text>
		</svg>
	);
}
