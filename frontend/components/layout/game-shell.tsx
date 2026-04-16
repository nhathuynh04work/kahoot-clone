"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/** Wraps game routes: fixed theme control so host/play match app light/dark preference. */
export function GameShell({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<div className="pointer-events-none fixed inset-0 z-[60] flex justify-end items-start p-3 md:p-4">
				<div className="pointer-events-auto">
					<ThemeToggle compact />
				</div>
			</div>
		</>
	);
}
