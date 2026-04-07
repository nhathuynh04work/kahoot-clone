"use client";

export function AdminPagination({
	page,
	totalPages,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	const safeTotalPages = Math.max(1, totalPages);
	const safePage = Math.min(safeTotalPages, Math.max(1, page));

	const siblings = 1;
	const pages: Array<number | "ellipsis"> = [];

	const pushRange = (start: number, end: number) => {
		for (let p = start; p <= end; p++) pages.push(p);
	};

	if (safeTotalPages <= 7) {
		pushRange(1, safeTotalPages);
	} else {
		pages.push(1);

		const left = Math.max(2, safePage - siblings);
		const right = Math.min(safeTotalPages - 1, safePage + siblings);

		if (left > 2) pages.push("ellipsis");
		pushRange(left, right);
		if (right < safeTotalPages - 1) pages.push("ellipsis");

		pages.push(safeTotalPages);
	}

	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				disabled={safePage <= 1}
				onClick={() => onPageChange(safePage - 1)}
				className="h-9 w-9 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
				aria-label="Previous page"
			>
				{"<"}
			</button>

			{pages.map((p, idx) => {
				if (p === "ellipsis") {
					return (
						<span
							key={`e-${idx}`}
							className="h-9 px-2 inline-flex items-center justify-center text-gray-500"
						>
							…
						</span>
					);
				}

				const active = p === safePage;
				return (
					<button
						key={p}
						type="button"
						onClick={() => onPageChange(p)}
						aria-current={active ? "page" : undefined}
						className={[
							"h-9 min-w-9 px-3 rounded-md border text-sm font-semibold transition-colors",
							active
								? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
								: "border-gray-700 bg-gray-800/50 text-gray-200 hover:bg-gray-800",
						].join(" ")}
					>
						{p}
					</button>
				);
			})}

			<button
				type="button"
				disabled={safePage >= safeTotalPages}
				onClick={() => onPageChange(safePage + 1)}
				className="h-9 w-9 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
				aria-label="Next page"
			>
				{">"}
			</button>
		</div>
	);
}

