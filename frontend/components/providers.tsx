"use client";

import { SocketProvider } from "@/features/game/context/socket-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<SocketProvider>{children}</SocketProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
