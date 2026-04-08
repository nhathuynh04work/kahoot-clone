"use client";

import type { ReportSort } from "@/features/game/api/server-actions";
import { Search, X } from "lucide-react";
import { Select } from "@/components/ui/select";

const SORT_OPTIONS: Array<{ value: ReportSort; label: string }> = [
	{ value: "endedAt_desc", label: "Newest" },
	{ value: "endedAt_asc", label: "Oldest" },
	{ value: "players_desc", label: "Players (high → low)" },
	{ value: "players_asc", label: "Players (low → high)" },
	{ value: "accuracy_desc", label: "Accuracy (high → low)" },
	{ value: "accuracy_asc", label: "Accuracy (low → high)" },
];

export function ReportToolbar({
	sort,
	onChangeSort,
	q,
	onChangeQ,
}: {
	sort: ReportSort;
	onChangeSort: (sort: ReportSort) => void;
	q?: string;
	onChangeQ: (q: string | undefined) => void;
}) {
	return (
		<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="relative w-full sm:max-w-md">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
					aria-hidden
				/>
				<input
					value={q ?? ""}
					onChange={(e) => onChangeQ(e.target.value)}
					placeholder="Search quiz titles…"
					className="w-full rounded-xl border border-gray-700 bg-gray-800/50 pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
					aria-label="Search reports by quiz title"
				/>
				{q?.trim() ? (
					<button
						type="button"
						onClick={() => onChangeQ(undefined)}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
						aria-label="Clear quiz title search"
					>
						<X className="w-4 h-4" aria-hidden />
					</button>
				) : null}
			</div>

			<div className="flex items-center gap-3 w-full sm:w-auto">
				<label className="text-xs text-gray-400 hidden sm:block">Sort</label>
				<div className="w-full sm:w-44">
					<Select
						value={sort}
						onValueChange={(v) => onChangeSort(v as ReportSort)}
						options={SORT_OPTIONS}
						ariaLabel="Sort sessions"
						buttonClassName="rounded-lg px-3 py-2"
					/>
				</div>
			</div>
		</div>
	);
}
