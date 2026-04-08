"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverlayPanel({
	open,
	onOpenChange,
	title,
	children,
	position = "left",
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	children: ReactNode;
	position?: "left" | "bottom";
}) {
	if (!open) return null;

	const isLeft = position === "left";

	return (
		<div
			className="fixed inset-0 z-60"
			role="dialog"
			aria-modal="true"
			aria-label={title ?? "Panel"}
		>
			<button
				type="button"
				className="absolute inset-0 bg-black/60"
				onClick={() => onOpenChange(false)}
				aria-label="Close"
			/>

			<div
				className={cn(
					"absolute bg-gray-900 border-gray-700 shadow-2xl flex flex-col overflow-hidden",
					isLeft
						? "left-0 top-0 bottom-0 w-[min(92vw,360px)] border-r"
						: "left-0 right-0 bottom-0 h-[min(85dvh,720px)] border-t rounded-t-2xl",
				)}
			>
				<div className="shrink-0 px-4 py-3 border-b border-gray-700 flex items-center gap-3">
					{title ? <p className="text-sm font-semibold text-white">{title}</p> : null}
					<button
						type="button"
						className="ml-auto inline-flex items-center justify-center h-9 w-9 rounded-lg text-gray-300 hover:bg-gray-800/70 transition-colors"
						onClick={() => onOpenChange(false)}
						aria-label="Close"
					>
						<X className="w-5 h-5" aria-hidden />
					</button>
				</div>

				<div className="flex-1 min-h-0 overflow-auto p-4">{children}</div>
			</div>
		</div>
	);
}

