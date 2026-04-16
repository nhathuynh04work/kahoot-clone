"use client";

import type { ReactNode } from "react";

export function AdminDetailShell({
	children,
}: {
	children: ReactNode;
}) {
	return <div className="space-y-4">{children}</div>;
}

export function AdminKeyValueGrid({
	items,
}: {
	items: Array<{ label: string; value: ReactNode }>;
}) {
	return (
		<div className="rounded-xl border border-(--app-border) bg-(--app-surface-muted)/60 p-4">
			<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
				{items.map((it) => (
					<div key={it.label} className="min-w-0">
						<dt className="text-xs text-(--app-fg-muted)">{it.label}</dt>
						<dd className="mt-1 text-sm text-(--app-fg) wrap-break-word">
							{it.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

