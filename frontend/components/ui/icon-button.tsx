import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseClass =
	"inline-flex items-center justify-center rounded-lg border border-(--app-border) bg-(--app-surface-muted) " +
	"text-(--app-fg) hover:bg-(--app-surface) transition-colors " +
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--app-ring) focus-visible:ring-offset-2 " +
	"focus-visible:ring-offset-(--app-surface) disabled:opacity-70 disabled:cursor-not-allowed";

export function iconButtonClassName(className?: string) {
	return cn(baseClass, className);
}

export function IconButton({
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
	return <button type="button" className={iconButtonClassName(className)} {...props} />;
}
