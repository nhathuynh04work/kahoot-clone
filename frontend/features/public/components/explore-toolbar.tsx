"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { appInputClassName } from "@/components/ui/app-input";
import { cn } from "@/lib/utils";

const TABS = ["quizzes", "documents"] as const;
export type ExploreTab = (typeof TABS)[number];

function normalizeTab(tab: string | null): ExploreTab {
	if (tab === "documents") return "documents";
	return "quizzes";
}

export function ExploreToolbar({
	defaultTab,
	defaultQ,
}: {
	defaultTab: ExploreTab;
	defaultQ: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlTab = normalizeTab(searchParams.get("tab"));
	const urlQ = searchParams.get("q") ?? "";

	const [tab, setTab] = useState<ExploreTab>(defaultTab);
	const [q, setQ] = useState(defaultQ);

	useEffect(() => setTab(urlTab), [urlTab]);
	useEffect(() => setQ(urlQ), [urlQ]);

	const setParams = useMemo(() => {
		return (patch: Record<string, string | undefined>) => {
			const next = new URLSearchParams(searchParams.toString());
			for (const [k, v] of Object.entries(patch)) {
				if (!v) next.delete(k);
				else next.set(k, v);
			}
			router.replace(`${pathname}?${next.toString()}`);
		};
	}, [pathname, router, searchParams]);

	useEffect(() => {
		const t = setTimeout(() => {
			setParams({
				q: q.trim() ? q.trim() : undefined,
				page: "1",
			});
		}, 250);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	useEffect(() => {
		setParams({ tab, page: "1" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab]);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<SegmentedTabs
				tabs={[
					{ id: "quizzes", label: "Quizzes" },
					{ id: "documents", label: "Documents" },
				]}
				activeId={tab}
				onChange={(id) => setTab(id)}
			/>

			<div className="relative w-full sm:max-w-sm sm:ml-auto">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--app-fg-muted)"
					aria-hidden
				/>
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					type="search"
					placeholder={`Search ${tab === "quizzes" ? "quizzes" : "documents"}…`}
					className={cn(appInputClassName, "rounded-xl pl-9 pr-4 py-2.5")}
					aria-label={`Search ${tab}`}
				/>
			</div>
		</div>
	);
}

