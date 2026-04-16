"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Slider({
	className,
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
	return (
		<SliderPrimitive.Root
			className={cn(
				"relative flex w-full touch-none select-none items-center",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-(--app-surface-muted) border border-(--app-border)">
				<SliderPrimitive.Range className="absolute h-full bg-indigo-500" />
			</SliderPrimitive.Track>
			{(props.value ?? props.defaultValue ?? []).map((_, i) => (
				<SliderPrimitive.Thumb
					key={i}
					className={cn(
						"block h-6 w-6 rounded-full border border-(--app-border) bg-(--app-elevated) shadow",
						"ring-offset-(--app-bg) transition-colors",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2",
					)}
				/>
			))}
		</SliderPrimitive.Root>
	);
}

