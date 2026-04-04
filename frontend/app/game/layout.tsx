"use client";

import { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh w-full overflow-hidden bg-gray-950 text-white">
			{children}
		</div>
	);
}

