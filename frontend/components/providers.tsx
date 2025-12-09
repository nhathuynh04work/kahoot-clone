"use client";

import { SocketProvider } from "@/features/game/context/socket-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<SocketProvider>{children}</SocketProvider>
		</QueryClientProvider>
	);
}
