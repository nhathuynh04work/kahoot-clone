import { useQuery } from "@tanstack/react-query";
import {
	getReportPage,
	type ReportPageResponse,
	type ReportSort,
} from "@/features/game/api/server-actions";

export const reportQueryKeys = {
	all: ["report"] as const,
	page: (args: {
		page: number;
		pageSize: number;
		q?: string;
		sort?: ReportSort;
	}) => [...reportQueryKeys.all, "page", args] as const,
};

export function useReportPageQuery(args: {
	page: number;
	pageSize: number;
	q?: string;
	sort?: ReportSort;
}) {
	return useQuery<ReportPageResponse>({
		queryKey: reportQueryKeys.page(args),
		queryFn: () => getReportPage(args),
		placeholderData: (prev) => prev,
	});
}
