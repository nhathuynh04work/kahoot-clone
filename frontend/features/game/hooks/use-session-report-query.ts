import { useQuery } from "@tanstack/react-query";
import {
	getSessionReport,
	type SessionReport,
} from "@/features/game/api/server-actions";

export const sessionReportQueryKeys = {
	all: ["session-report"] as const,
	byLobbyId: (lobbyId: number) =>
		[...sessionReportQueryKeys.all, lobbyId] as const,
};

export function useSessionReportQuery(lobbyId: number) {
	return useQuery<SessionReport>({
		queryKey: sessionReportQueryKeys.byLobbyId(lobbyId),
		queryFn: () => getSessionReport(lobbyId),
	});
}

