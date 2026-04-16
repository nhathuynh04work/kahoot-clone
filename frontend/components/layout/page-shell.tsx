import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
	children: ReactNode;
	className?: string;
	maxWidthClassName?: string;
};

export function PageShell({
	children,
	className,
	maxWidthClassName = "max-w-6xl",
}: PageShellProps) {
	return (
		<div className={cn("min-h-dvh bg-(--app-bg) text-(--app-fg)", className)}>
			<div className={cn("w-full mx-auto p-4 sm:p-6 md:p-8", maxWidthClassName)}>
				{children}
			</div>
		</div>
	);
}

