"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { useQuizSearchInfiniteQuery } from "@/features/quizzes/hooks/use-quiz-search-infinite";

export function ReportQuizFilter({
	quizId,
	onChangeQuizId,
}: {
	quizId?: number;
	onChangeQuizId: (nextQuizId: number | undefined) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 250);

	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!open) return;
		const onDocMouseDown = (e: MouseEvent) => {
			if (!rootRef.current) return;
			if (rootRef.current.contains(e.target as Node)) return;
			setOpen(false);
		};
		document.addEventListener("mousedown", onDocMouseDown);
		return () => document.removeEventListener("mousedown", onDocMouseDown);
	}, [open]);

	const quizSearch = useQuizSearchInfiniteQuery({
		q: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
		pageSize: 20,
		enabled: open,
	});

	const items: QuizWithQuestions[] = useMemo(() => {
		const pages = quizSearch.data?.pages ?? [];
		return pages.flatMap((p) => p.items);
	}, [quizSearch.data]);

	const selectedLabel = useMemo(() => {
		if (!quizId) return "All quizzes";
		const match = items.find((q) => q.id === quizId);
		const title = match?.title?.trim() ? match.title : match ? "Untitled Quiz" : null;
		return title ? title : `Quiz #${quizId}`;
	}, [quizId, items]);

	return (
		<div className="flex-1 min-w-0" ref={rootRef}>
			<div className="relative">
				<div className="w-full flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							setOpen((v) => !v);
							if (!open) {
								setQuery("");
							}
						}}
						className="flex-1 min-w-0 flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-left hover:bg-gray-800 text-sm"
						aria-label="Filter by quiz"
					>
						<div className="min-w-0 truncate text-white font-medium">
							{selectedLabel}
						</div>
						<span className="shrink-0 text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
					</button>
					{quizId ? (
						<button
							type="button"
							onClick={() => onChangeQuizId(undefined)}
							className="shrink-0 text-xs px-2 py-2 rounded-lg border border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white hover:border-gray-600"
							aria-label="Clear quiz filter"
						>
							Clear
						</button>
					) : null}
				</div>

				{open ? (
					<div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 shadow-xl overflow-hidden">
						<div className="p-3 border-b border-gray-700">
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search quizzes…"
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div className="max-h-72 overflow-auto">
							<button
								type="button"
								onClick={() => {
									onChangeQuizId(undefined);
									setOpen(false);
								}}
								className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-gray-200"
							>
								All quizzes
							</button>

							{items.map((q) => {
								const title = q.title?.trim() ? q.title : "Untitled Quiz";
								const active = quizId === q.id;
								return (
									<button
										key={q.id}
										type="button"
										onClick={() => {
											onChangeQuizId(q.id);
											setOpen(false);
										}}
										className={[
											"w-full px-3 py-2 text-left text-sm hover:bg-gray-800",
											active ? "bg-gray-800 text-white" : "text-gray-200",
										].join(" ")}
									>
										<div className="truncate">{title}</div>
									</button>
								);
							})}

							<div className="p-3 flex items-center justify-between gap-2">
								<div className="text-xs text-gray-500">
									{quizSearch.data?.pages?.[0]
										? `${quizSearch.data.pages[0].totalItems} quizzes`
										: "—"}
								</div>
								<button
									type="button"
									disabled={
										quizSearch.isFetchingNextPage ||
										!quizSearch.hasNextPage ||
										quizSearch.isLoading
									}
									onClick={() => quizSearch.fetchNextPage()}
									className="text-xs px-2 py-1 rounded-md border border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{quizSearch.isFetchingNextPage
										? "Loading…"
										: quizSearch.hasNextPage
											? "Load more"
											: "No more"}
								</button>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
