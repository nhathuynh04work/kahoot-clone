"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export function HostCoverBackground({
	coverUrl,
	children,
}: {
	coverUrl?: string;
	children: ReactNode;
}) {
	const effectiveCoverUrl =
		typeof coverUrl === "string" && coverUrl.trim().length > 0
			? coverUrl
			: "/backgrounds/default.jpg";

	return (
		<div className="relative min-h-dvh overflow-hidden bg-white dark:bg-(--app-bg)">
			<div className="pointer-events-none absolute inset-0">
				<Image
					src={effectiveCoverUrl}
					alt=""
					fill
					priority
					className="object-cover opacity-60 scale-105"
					sizes="100vw"
				/>
			</div>
			<div className="pointer-events-none absolute inset-0 bg-white/50 dark:bg-(--app-bg)/50" />
			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/20" />

			<div className="relative z-10 min-h-dvh">{children}</div>
		</div>
	);
}

