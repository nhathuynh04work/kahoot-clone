import { ReactNode } from "react";

export default async function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-(--app-bg) text-(--app-fg)">{children}</div>
	);
}

