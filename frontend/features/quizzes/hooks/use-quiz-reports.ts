"use client";

import { useCallback, useEffect } from "react";
import { useQuizSessions } from "./use-quiz-sessions";

export function useQuizReports(quizId: number) {
	const {
		sessions,
		sessionsLoading,
		selectedReport,
		reportLoading,
		loadSessions,
		viewSession,
		clearReport,
	} = useQuizSessions(quizId);

	useEffect(() => {
		if (quizId && sessions === null && !sessionsLoading) {
			void loadSessions();
		}
	}, [quizId, loadSessions, sessions, sessionsLoading]);

	const ensureSessionsLoaded = useCallback(() => {
		if (sessions === null && !sessionsLoading) {
			void loadSessions();
		}
	}, [loadSessions, sessions, sessionsLoading]);

	return {
		sessions,
		sessionsLoading,
		selectedReport,
		reportLoading,
		loadSessions,
		viewSession,
		clearReport,
		ensureSessionsLoaded,
	};
}
