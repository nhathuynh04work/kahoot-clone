"use client";

import { useCallback, useState } from "react";
import { X, Loader2, Play } from "lucide-react";
import Link from "next/link";
import type { QuizWithQuestions } from "../types";
import { useCreateLobby } from "../hooks/use-create-lobby";
import { useFullQuiz } from "../hooks/use-full-quiz";
import { useQuizSessions } from "../hooks/use-quiz-sessions";
import { QuestionsPane } from "./quiz-details-modal-questions-pane";
import { StatsPane } from "./quiz-details-modal-stats-pane";

export interface QuizDetailsDrawerProps {
	quiz: QuizWithQuestions;
	onClose: () => void;
}

export function QuizDetailsDrawer({ quiz, onClose }: QuizDetailsDrawerProps) {
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);
	const [activeTab, setActiveTab] = useState<"questions" | "stats">(
		"questions",
	);
	const { fullQuiz, questionsLoading } = useFullQuiz(quiz.id);
	const {
		sessions,
		sessionsLoading,
		selectedReport,
		reportLoading,
		loadSessions,
		viewSession,
		clearReport,
	} = useQuizSessions(quiz.id);

	const handleStatsTabClick = useCallback(() => {
		setActiveTab("stats");
		if (sessions === null && !sessionsLoading) {
			void loadSessions();
		}
	}, [loadSessions, sessions, sessionsLoading]);

	const authorName =
		fullQuiz?.authorName ?? quiz.authorName ?? "Unknown author";

	return (
		<div
			className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] p-0 flex items-end justify-center"
			onClick={onClose}
			aria-modal
			role="dialog"
		>
			<div
				className="relative w-full max-w-none h-[calc(100dvh-58px)] max-h-[calc(100dvh-58px)] overflow-hidden rounded-t-2xl bg-gray-800 border border-gray-700 shadow-2xl flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-start justify-between p-4 border-b border-gray-700 shrink-0">
					<div className="min-w-0">
						<p className="text-xs text-gray-400 font-medium truncate">
							{authorName ? `by ${authorName}` : ""}
						</p>
						<h3 className="text-lg font-semibold text-white truncate pr-4 mt-1">
							{quiz.title || "Untitled Quiz"}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shrink-0"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-gray-700 shrink-0">
					<button
						type="button"
						onClick={() => setActiveTab("questions")}
						className={`flex-1 py-3 text-sm font-medium transition-colors ${
							activeTab === "questions"
								? "text-indigo-400 border-b-2 border-indigo-400"
								: "text-gray-400 hover:text-white"
						}`}
					>
						Questions
					</button>
					<button
						type="button"
						onClick={handleStatsTabClick}
						className={`flex-1 py-3 text-sm font-medium transition-colors ${
							activeTab === "stats"
								? "text-indigo-400 border-b-2 border-indigo-400"
								: "text-gray-400 hover:text-white"
						}`}
					>
						Session Stats
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden p-4">
					{activeTab === "questions" && (
						<QuestionsPane
							key={quiz.id}
							quiz={quiz}
							fullQuiz={fullQuiz}
							questionsLoading={questionsLoading}
						/>
					)}

					{activeTab === "stats" && (
						<StatsPane
							sessions={sessions}
							sessionsLoading={sessionsLoading}
							selectedReport={selectedReport}
							reportLoading={reportLoading}
							onViewSession={viewSession}
							onBackToSessions={clearReport}
						/>
					)}
				</div>

				{/* Footer actions */}
				<div className="flex justify-between items-center gap-4 p-4 border-t border-gray-700 shrink-0">
					<Link
						href={`/quiz/${quiz.id}/edit`}
						className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
					>
						Edit quiz
					</Link>
					<button
						type="button"
						disabled={isPending}
						onClick={() => createLobby()}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
					>
						{isPending ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Play className="w-4 h-4" />
						)}
						{isPending ? "Starting…" : "Start game"}
					</button>
				</div>
			</div>
		</div>
	);
}

