import { ReactNode } from "react";

export default async function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-gray-900 text-white">{children}</div>
	);
}

