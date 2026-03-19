"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type UserAvatarProps = {
	/** Displayed as the avatar initial (first character of name). */
	name?: string | null;
	/** Size in pixels. */
	size?: number;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function UserAvatar({
	name,
	size = 32,
	className,
	...rest
}: UserAvatarProps) {
	const cleaned = (name ?? "").trim();
	const initial = cleaned.length > 0 ? cleaned[0].toUpperCase() : "?";

	const fontSize = Math.max(12, Math.round(size * 0.42));

	return (
		<div
			{...rest}
			className={cn(
				"rounded-full bg-gray-700 text-gray-200 flex items-center justify-center font-semibold shrink-0 select-none",
				className,
			)}
			style={{
				width: size,
				height: size,
				fontSize,
				lineHeight: 1,
			}}
			aria-label={cleaned ? `Avatar for ${cleaned}` : "Avatar"}
		>
			{initial}
		</div>
	);
}

