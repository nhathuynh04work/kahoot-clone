"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";

const SORT_OPTIONS = [
	{ value: "createdAt_desc", label: "Newest" },
	{ value: "createdAt_asc", label: "Oldest" },
	{ value: "title_asc", label: "Title (A–Z)" },
	{ value: "title_desc", label: "Title (Z–A)" },
] as const;

export type QuizDashboardSort = (typeof SORT_OPTIONS)[number]["value"];

export function DashboardQuizToolbar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlSort = (searchParams.get("sort") as QuizDashboardSort | null) ?? "createdAt_desc";

	const [q, setQ] = useState(urlQ);
	const [sort, setSort] = useState<QuizDashboardSort>(urlSort);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setSort(urlSort), [urlSort]);

	const setParams = (patch: Record<string, string | undefined>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (!v) next.delete(k);
			else next.set(k, v);
		}
		router.replace(`${pathname}?${next.toString()}`);
	};

	// Debounce search so server navigation isn't overly chatty.
	useEffect(() => {
		const t = setTimeout(() => {
			setParams({ q: q.trim() ? q.trim() : undefined });
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	const sortOptions = useMemo(() => SORT_OPTIONS, []);

	return (
		<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="relative w-full sm:max-w-md">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
					aria-hidden
				/>
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					type="search"
					placeholder="Search by title…"
					className="w-full rounded-xl border border-gray-700 bg-gray-800/50 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
					aria-label="Search quizzes by title"
				/>
			</div>

			<div className="flex items-center gap-3">
				<label className="text-xs text-gray-400 hidden sm:block">Sort</label>
				<div className="w-44">
					<Select
						value={sort}
						onValueChange={(v) => {
							const next = v as QuizDashboardSort;
							setSort(next);
							setParams({ sort: next });
						}}
						options={sortOptions}
						ariaLabel="Sort quizzes"
					/>
				</div>
			</div>
		</div>
	);
}

