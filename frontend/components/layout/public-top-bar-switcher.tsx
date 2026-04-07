"use client";

import { usePathname } from "next/navigation";
import type { User } from "@/features/auth/types";
import TopBar from "@/components/layout/top-bar";
import { LandingTopBar } from "@/components/layout/landing-top-bar";

export function PublicTopBarSwitcher({ user }: { user?: User | null }) {
	const pathname = usePathname();
	const isLanding = pathname === "/";

	if (!user && isLanding) {
		return <LandingTopBar />;
	}

	return <TopBar user={user} />;
}
