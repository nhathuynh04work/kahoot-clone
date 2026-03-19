import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
	return (
		<span className={cn("inline-flex items-baseline gap-0", className)}>
			<span className="text-white">quiztopia</span>
			<span className="text-emerald-400">!</span>
		</span>
	);
}

