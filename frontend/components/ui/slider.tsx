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
			<SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-800 border border-gray-700">
				<SliderPrimitive.Range className="absolute h-full bg-indigo-500" />
			</SliderPrimitive.Track>
			{(props.value ?? props.defaultValue ?? []).map((_, i) => (
				<SliderPrimitive.Thumb
					key={i}
					className={cn(
						"block h-6 w-6 rounded-full border border-gray-700 bg-gray-100 shadow",
						"ring-offset-gray-950 transition-colors",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2",
					)}
				/>
			))}
		</SliderPrimitive.Root>
	);
}

