"use client";

import type { ReactNode } from "react";
import { AdminPageHeader, type AdminCrumb } from "@/features/admin/components/admin-page-header";

export function AdminManagementShell({
	children,
	crumbs,
	headerRight,
}: {
	children: ReactNode;
	crumbs?: AdminCrumb[];
	headerRight?: ReactNode;
}) {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<AdminPageHeader crumbs={crumbs}>
					{headerRight}
				</AdminPageHeader>
				{children}
			</div>
		</div>
	);
}

