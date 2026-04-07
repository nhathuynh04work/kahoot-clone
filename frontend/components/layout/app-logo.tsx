import { cn } from "@/lib/utils";
import { QMarkLogo } from "@/components/brand/q-mark-logo";

type AppLogoProps = {
	className?: string;
	/** Compact “q!” mark for favicon-sized or tight UI slots; default is full wordmark. */
	variant?: "wordmark" | "mark";
};

export function AppLogo({ className, variant = "wordmark" }: AppLogoProps) {
	if (variant === "mark") {
		return (
			<span
				className={cn("inline-flex items-baseline text-white", className)}
				role="img"
				aria-label="Quiztopia"
			>
				<QMarkLogo />
			</span>
		);
	}

	return (
		<span
			className={cn("inline-flex items-baseline gap-0 text-white", className)}
			role="img"
			aria-label="Quiztopia"
		>
			<span className="text-white">quiztopia</span>
			<span className="text-indigo-600">!</span>
		</span>
	);
}
