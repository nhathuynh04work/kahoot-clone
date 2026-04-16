import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const appInputClassName =
	"w-full rounded-lg border border-(--app-border) bg-(--app-input-bg) text-(--app-fg) placeholder:text-(--app-fg-muted)/60 " +
	"text-sm focus:outline-none focus:ring-2 focus:ring-(--app-ring)/70 focus:border-transparent " +
	"[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none";

export function AppInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(appInputClassName, className)} {...props} />;
}
