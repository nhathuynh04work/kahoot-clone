import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Join a game",
	description: "Enter a game PIN to join a live Quiztopia session.",
};

export default function GameJoinLayout({ children }: { children: ReactNode }) {
	return children;
}
