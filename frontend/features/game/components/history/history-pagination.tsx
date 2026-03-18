"use client";

export function HistoryPagination({
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
	return (
		<div className="mt-6 flex items-center justify-between gap-3">
			<div className="text-sm text-gray-400">
				Page <span className="text-white font-medium">{page}</span> of{" "}
				<span className="text-white font-medium">{totalPages}</span>
				<span className="text-gray-600"> • </span>
				<span className="text-gray-300">{totalItems}</span> sessions
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onPrev}
					disabled={page <= 1}
					className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
				>
					Prev
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={page >= totalPages}
					className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
				>
					Next
				</button>
			</div>
		</div>
	);
}

