"use client";

import { useCallback, useMemo, useState } from "react";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { useCreateLobby } from "@/features/quizzes/hooks/use-create-lobby";
import { useDrawerVisibility } from "@/features/quizzes/hooks/use-drawer-visibility";
import { useFullQuiz } from "@/features/quizzes/hooks/use-full-quiz";
import { useQuizReports } from "@/features/quizzes/hooks/use-quiz-reports";
import { QuizDetailsDrawerShell } from "./quiz-details-drawer-shell";
import { QuizDetailsQuestionsPane } from "./quiz-details-questions-pane";
import { QuizDetailsReportsPane } from "./quiz-details-reports-pane";

const DRAWER_TRANSITION_MS = 250;

export interface QuizDetailsDrawerProps {
	quiz: QuizWithQuestions;
	onClose: () => void;
}

export function QuizDetailsDrawerContainer({
	quiz,
	onClose,
}: QuizDetailsDrawerProps) {
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);
	const [activeTab, setActiveTab] = useState<"questions" | "reports">(
		"questions",
	);
	const { fullQuiz, questionsLoading } = useFullQuiz(quiz.id);
	const {
		sessions,
		sessionsLoading,
		selectedReport,
		reportLoading,
		viewSession,
		clearReport,
		ensureSessionsLoaded,
	} = useQuizReports(quiz.id);

	const { close, backdropStyle, panelStyle, onBackdropClick } =
		useDrawerVisibility({
			onClose,
			transitionMs: DRAWER_TRANSITION_MS,
		});

	const handleTabChange = useCallback(
		(id: string) => {
			if (id === "reports") {
				setActiveTab("reports");
				ensureSessionsLoaded();
			} else {
				setActiveTab("questions");
			}
		},
		[ensureSessionsLoaded],
	);

	const authorName = useMemo(
		() => fullQuiz?.authorName ?? quiz.authorName ?? "Unknown author",
		[fullQuiz?.authorName, quiz.authorName],
	);

	const playCount = sessions?.length ?? 0;
	const participantCount = useMemo(
		() => sessions?.reduce((sum, s) => sum + s.totalPlayers, 0) ?? 0,
		[sessions],
	);

	const tabContent =
		activeTab === "questions" ? (
			<QuizDetailsQuestionsPane
				key={quiz.id}
				quiz={quiz}
				fullQuiz={fullQuiz}
				questionsLoading={questionsLoading}
			/>
		) : (
			<QuizDetailsReportsPane
				sessions={sessions}
				sessionsLoading={sessionsLoading}
				selectedReport={selectedReport}
				reportLoading={reportLoading}
				onViewSession={viewSession}
				onBackToSessions={clearReport}
			/>
		);

	return (
		<QuizDetailsDrawerShell
			authorName={authorName}
			onClose={close}
			coverUrl={quiz.coverUrl}
			title={quiz.title || "Untitled Quiz"}
			playsLabel={sessionsLoading ? "…" : `${playCount} plays`}
			participantsLabel={
				sessionsLoading ? "…" : `${participantCount} participants`
			}
			quizId={quiz.id}
			isHostPending={isPending}
			onHostLive={() => createLobby()}
			activeTabId={activeTab}
			onTabChange={handleTabChange}
			backdropStyle={backdropStyle}
			panelStyle={panelStyle}
			onBackdropClick={onBackdropClick}
			tabContent={tabContent}
		/>
	);
}

