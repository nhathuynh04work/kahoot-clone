import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HistorySort } from "@/features/game/api/server-actions";

export function useHistorySearchParams() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
	const pageSize = Math.min(
		50,
		Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20),
	);
	const sort = (searchParams.get("sort") as HistorySort | null) ?? "endedAt_desc";
	const quizId = (() => {
		const raw = searchParams.get("quizId");
		if (!raw) return undefined;
		const parsed = parseInt(raw, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	})();

	const setParams = (patch: Record<string, string | undefined>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(patch)) {
			if (v === undefined || v === "") next.delete(k);
			else next.set(k, v);
		}
		router.replace(`${pathname}?${next.toString()}`);
	};

	return { page, pageSize, sort, quizId, setParams };
}

