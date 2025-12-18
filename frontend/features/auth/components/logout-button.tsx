"use client";

import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoutButtonProps {
	children: ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await apiClient.post("/auth/logout");
			router.refresh();
			router.push("/auth/login");
		} catch {}
	};

	return <button onClick={handleLogout}>{children}</button>;
};
