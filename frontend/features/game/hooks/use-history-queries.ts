import { useQuery } from "@tanstack/react-query";
import {
	getHistoryPage,
	type HistoryPageResponse,
	type HistorySort,
} from "@/features/game/api/server-actions";

export const historyQueryKeys = {
	all: ["history"] as const,
	page: (args: {
		page: number;
		pageSize: number;
		q?: string;
		sort?: HistorySort;
	}) => [...historyQueryKeys.all, "page", args] as const,
};

export function useHistoryPageQuery(args: {
	page: number;
	pageSize: number;
	q?: string;
	sort?: HistorySort;
}) {
	return useQuery<HistoryPageResponse>({
		queryKey: historyQueryKeys.page(args),
		queryFn: () => getHistoryPage(args),
		placeholderData: (prev) => prev,
	});
}

