"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemedToaster() {
	const { resolvedTheme } = useTheme();

	return (
		<Toaster
			theme={resolvedTheme}
			duration={3000}
			position="bottom-center"
		/>
	);
}

