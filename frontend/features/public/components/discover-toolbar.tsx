"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

export type DiscoverTab = "quizzes" | "documents";

function normalizeTab(tab: string | null): DiscoverTab {
	if (tab === "documents") return "documents";
	return "quizzes";
}

export function DiscoverToolbar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlQ = searchParams.get("q") ?? "";
	const urlTab = normalizeTab(searchParams.get("tab"));

	const [q, setQ] = useState(urlQ);
	const [tab, setTab] = useState<DiscoverTab>(urlTab);

	useEffect(() => setQ(urlQ), [urlQ]);
	useEffect(() => setTab(urlTab), [urlTab]);

	const placeholder = useMemo(() => {
		return tab === "documents" ? "Search documents…" : "Search quizzes…";
	}, [tab]);

	const ariaLabel = useMemo(() => {
		return tab === "documents"
			? "Search public documents by name"
			: "Search public quizzes by title";
	}, [tab]);

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
			setParams({ q: q.trim() ? q.trim() : undefined, page: "1" });
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	useEffect(() => {
		setParams({ tab, page: "1" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab]);

	return (
		<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<SegmentedTabs
				tabs={[
					{ id: "quizzes", label: "Quizzes" },
					{ id: "documents", label: "Documents" },
				]}
				activeId={tab}
				onChange={setTab}
			/>

			<div className="relative w-full sm:max-w-sm sm:ml-auto">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
					aria-hidden
				/>
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					type="search"
					placeholder={placeholder}
					className="w-full rounded-xl border border-gray-700 bg-gray-800/50 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
					aria-label={ariaLabel}
				/>
			</div>
		</div>
	);
}

