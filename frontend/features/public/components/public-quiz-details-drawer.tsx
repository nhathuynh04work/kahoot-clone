"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { QuizFullDetails, QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsDrawerShell } from "@/features/quizzes/components/quiz-details-drawer/quiz-details-drawer-shell";
import { QuizDetailsQuestionsPane } from "@/features/quizzes/components/quiz-details-drawer/quiz-details-questions-pane";
import { useDrawerVisibility } from "@/features/quizzes/hooks/use-drawer-visibility";

const DRAWER_TRANSITION_MS = 250;

export function PublicQuizDetailsDrawer({
	quizId,
	publicQuiz,
}: {
	quizId: number;
	publicQuiz: (QuizFullDetails & { saveCount?: number; playCount?: number }) | null;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const from = searchParams.get("from");

	useEffect(() => {
		if (from) router.prefetch(from);
	}, [from, router]);

	const { close, backdropStyle, panelStyle, onBackdropClick } =
		useDrawerVisibility({
			onClose: () => {
				if (from) router.push(from);
				else router.push("/discover");
			},
			transitionMs: DRAWER_TRANSITION_MS,
		});

	const authorName = useMemo(() => {
		if (!publicQuiz) return "Private quiz";
		return publicQuiz.authorName ?? "Unknown author";
	}, [publicQuiz]);

	const title = publicQuiz?.title?.trim() ? publicQuiz.title : "This quiz is private";

	const playsLabel = publicQuiz
		? `${publicQuiz.playCount ?? 0} plays`
		: "Private";
	const participantsLabel = publicQuiz ? "Public" : "Unavailable";

	const quizStub: QuizWithQuestions = useMemo(() => {
		if (!publicQuiz) {
			return {
				id: quizId,
				userId: 0,
				title: "",
				createdAt: new Date(),
				questions: [],
			};
		}
		const { questions, ...rest } = publicQuiz;
		return {
			...(rest as any),
			questions: questions.map(({ options: _options, ...q }) => q),
		};
	}, [publicQuiz, quizId]);

	return (
		<QuizDetailsDrawerShell
			authorName={authorName}
			onClose={close}
			coverUrl={publicQuiz?.coverUrl}
			title={title}
			playsLabel={playsLabel}
			participantsLabel={participantsLabel}
			quizId={quizId}
			hideSidebar
			sharePath={publicQuiz ? `/quiz/${quizId}` : undefined}
			backdropStyle={backdropStyle}
			panelStyle={panelStyle}
			onBackdropClick={onBackdropClick}
			content={
				publicQuiz ? (
					<QuizDetailsQuestionsPane
						quiz={quizStub}
						fullQuiz={publicQuiz}
						questionsLoading={false}
					/>
				) : (
					<div className="py-10 text-center">
						<p className="text-white font-semibold">This quiz is private.</p>
						<p className="mt-2 text-sm text-gray-400">
							If you have access, sign in and open it from your dashboard.
						</p>
					</div>
				)
			}
		/>
	);
}

