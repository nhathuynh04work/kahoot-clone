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
				? "opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700 text-gray-400"
				: "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800",
		].join(" ");

	return (
		<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-xs text-gray-400">
				Page {page} / {totalPages}
				<span className="text-gray-600"> · </span>
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
