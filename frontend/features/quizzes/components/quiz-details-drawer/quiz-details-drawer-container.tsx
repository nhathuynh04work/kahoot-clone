"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { useCreateLobby } from "@/features/quizzes/hooks/use-create-lobby";
import { useDrawerVisibility } from "@/features/quizzes/hooks/use-drawer-visibility";
import { useFullQuiz } from "@/features/quizzes/hooks/use-full-quiz";
import { useQuizReports } from "@/features/quizzes/hooks/use-quiz-reports";
import { QuizDetailsDrawerShell } from "./quiz-details-drawer-shell";
import { QuizDetailsQuestionsPane } from "./quiz-details-questions-pane";
import { getMySavedQuizIds } from "@/features/quizzes/api/client-actions";

const DRAWER_TRANSITION_MS = 250;

export interface QuizDetailsDrawerProps {
	quiz: QuizWithQuestions;
	onClose: () => void;
	viewerId?: number;
	variant?: "default" | "public";
}

export function QuizDetailsDrawerContainer({
	quiz,
	onClose,
	viewerId,
	variant = "default",
}: QuizDetailsDrawerProps) {
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);
	const isPublic = variant === "public";
	const { fullQuiz, questionsLoading } = useFullQuiz(quiz.id, { variant });
	const isOwner = typeof viewerId === "number" && viewerId === quiz.userId;
	const {
		sessions,
		sessionsLoading,
		ensureSessionsLoaded,
	} = useQuizReports(quiz.id);

	useEffect(() => {
		ensureSessionsLoaded();
	}, [ensureSessionsLoaded]);

	const { close, backdropStyle, panelStyle, onBackdropClick } =
		useDrawerVisibility({
			onClose,
			transitionMs: DRAWER_TRANSITION_MS,
			topGap: isPublic ? "58px" : undefined,
		});

	const showSaveButton =
		typeof viewerId === "number" && !isOwner;

	const { data: mySavedQuizIds = [] } = useQuery({
		queryKey: ["mySavedQuizzes"],
		queryFn: getMySavedQuizIds,
		enabled: showSaveButton,
	});
	const isSaved = mySavedQuizIds.includes(quiz.id);

	const authorName = useMemo(
		() => fullQuiz?.authorName ?? quiz.authorName ?? "Unknown author",
		[fullQuiz?.authorName, quiz.authorName],
	);

	const playCount = sessions?.length ?? 0;
	const participantCount = useMemo(
		() => sessions?.reduce((sum, s) => sum + s.totalPlayers, 0) ?? 0,
		[sessions],
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
			showSaveButton={showSaveButton}
			initialIsSaved={showSaveButton ? isSaved : undefined}
			isOwner={isOwner}
			initialVisibility={
				isOwner
					? ((fullQuiz?.visibility ?? quiz.visibility) as
							| "PUBLIC"
							| "PRIVATE")
					: undefined
			}
			backdropStyle={backdropStyle}
			panelStyle={panelStyle}
			onBackdropClick={onBackdropClick}
			hideSidebar={false}
			portal={isPublic}
			content={
				<QuizDetailsQuestionsPane
					key={quiz.id}
					quiz={quiz}
					fullQuiz={fullQuiz}
					questionsLoading={questionsLoading}
				/>
			}
		/>
	);
}

