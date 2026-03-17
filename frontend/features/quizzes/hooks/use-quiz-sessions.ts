import { useCallback, useState } from "react";
import {
	getSessionsForQuiz,
	getSessionReport,
	type SessionListItem,
	type SessionReport,
} from "@/features/game/api/server-actions";

export function useQuizSessions(quizId: number) {
	const [sessions, setSessions] = useState<SessionListItem[] | null>(null);
	const [sessionsLoading, setSessionsLoading] = useState(false);
	const [selectedReport, setSelectedReport] = useState<SessionReport | null>(
		null
	);
	const [reportLoading, setReportLoading] = useState(false);

	const loadSessions = useCallback(async () => {
		setSessionsLoading(true);
		try {
			const data = await getSessionsForQuiz(quizId);
			setSessions(data);
		} catch {
			setSessions([]);
		} finally {
			setSessionsLoading(false);
		}
	}, [quizId]);

	const viewSession = useCallback(async (lobbyId: number) => {
		setReportLoading(true);
		setSelectedReport(null);
		try {
			const report = await getSessionReport(lobbyId);
			setSelectedReport(report);
		} catch {
			setSelectedReport(null);
		} finally {
			setReportLoading(false);
		}
	}, []);

	const clearReport = useCallback(() => {
		setSelectedReport(null);
	}, []);

	return {
		sessions,
		sessionsLoading,
		selectedReport,
		reportLoading,
		loadSessions,
		viewSession,
		clearReport,
	};
}

