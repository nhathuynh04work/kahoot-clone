"use client";

import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { reconnectSocket } from "@/features/game/lib/socket";

interface LogoutButtonProps {
	children: ReactNode;
	className: string;
}

export const LogoutButton = ({ children, className }: LogoutButtonProps) => {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await apiClient.post("/auth/logout");
			reconnectSocket();
			router.refresh();
			router.push("/");
		} catch {}
	};

	return (
		<button onClick={handleLogout} className={className}>
			{children}
		</button>
	);
};
