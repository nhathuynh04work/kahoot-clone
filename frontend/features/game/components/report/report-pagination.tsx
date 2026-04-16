"use client";

export function ReportPagination({
	page,
	totalPages,
	totalItems,
	onPrev,
	onNext,
}: {
	page: number;
	totalPages: number;
	totalItems: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	const btnClass = (disabled: boolean) =>
		[
			"px-3 py-2 rounded-lg text-sm border transition-colors",
			disabled
				? "opacity-50 cursor-not-allowed bg-(--app-surface-muted)/40 border-(--app-border) text-(--app-fg-muted)"
				: "bg-(--app-surface-muted) border-(--app-border) text-(--app-fg) hover:bg-(--app-surface)",
		].join(" ");

	return (
		<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-xs text-(--app-fg-muted)">
				Page {page} / {totalPages}
				<span className="text-(--app-fg-muted)/60"> · </span>
				{totalItems} sessions
			</p>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onPrev}
					disabled={page <= 1}
					className={btnClass(page <= 1)}
				>
					Previous
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={page >= totalPages}
					className={btnClass(page >= totalPages)}
				>
					Next
				</button>
			</div>
		</div>
	);
}
