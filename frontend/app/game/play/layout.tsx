import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Play",
};

export default function GamePlayLayout({ children }: { children: ReactNode }) {
	return children;
}
