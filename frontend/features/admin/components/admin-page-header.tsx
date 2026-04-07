"use client";

import Link from "next/link";

export type AdminCrumb = {
	label: string;
	href?: string;
};

export function AdminPageHeader({
	crumbs,
	children,
}: {
	crumbs?: AdminCrumb[];
	children?: React.ReactNode;
}) {
	const safeCrumbs = (crumbs ?? []).filter(Boolean);

	return (
		<div className="flex flex-col gap-3">
			{safeCrumbs.length ? (
				<nav aria-label="Breadcrumb" className="text-base text-gray-200 font-semibold">
					<ol className="flex items-center gap-2 flex-wrap">
						{safeCrumbs.map((c, idx) => {
							const isLast = idx === safeCrumbs.length - 1;
							const content = c.href ? (
								<Link
									href={c.href}
									className="text-gray-300 hover:text-white transition-colors"
								>
									{c.label}
								</Link>
							) : (
								<span className={isLast ? "text-white font-bold" : undefined}>
									{c.label}
								</span>
							);

							return (
								<li key={`${c.label}-${idx}`} className="flex items-center gap-2">
									{content}
									{isLast ? null : <span className="text-gray-600">{">"}</span>}
								</li>
							);
						})}
					</ol>
				</nav>
			) : null}

			{children ? <div className="flex items-start justify-end">{children}</div> : null}
		</div>
	);
}

