"use client";

import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoutButtonProps {
	children: ReactNode;
	className: string;
}

export const LogoutButton = ({ children, className }: LogoutButtonProps) => {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await apiClient.post("/auth/logout");
			router.refresh();
			router.push("/auth/login");
		} catch {}
	};

	return (
		<button onClick={handleLogout} className={className}>
			{children}
		</button>
	);
};
