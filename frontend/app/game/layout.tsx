import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Game",
	robots: { index: false, follow: false },
};

export default function GameLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh w-full overflow-hidden bg-(--app-bg) text-(--app-fg)">
			{children}
		</div>
	);
}
