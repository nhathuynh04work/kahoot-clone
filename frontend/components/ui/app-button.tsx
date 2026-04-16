import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantClass = {
	primary:
		"bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-transparent",
	secondary:
		"border border-(--app-border) bg-(--app-surface-muted) text-(--app-fg) hover:bg-(--app-surface)",
	ghost:
		"border border-transparent bg-transparent text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted)",
	danger:
		"border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15",
} as const;

export type AppButtonVariant = keyof typeof variantClass;

const baseClass =
	"inline-flex items-center justify-center gap-2 font-semibold text-sm transition-colors rounded-lg " +
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--app-ring) focus-visible:ring-offset-2 " +
	"focus-visible:ring-offset-(--app-surface) disabled:opacity-70 disabled:cursor-not-allowed";

export function appButtonClassName(
	variant: AppButtonVariant = "primary",
	className?: string,
) {
	return cn(baseClass, variantClass[variant], className);
}

export function AppButton({
	variant = "primary",
	className,
	type = "button",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: AppButtonVariant }) {
	return <button type={type} className={appButtonClassName(variant, className)} {...props} />;
}
