"use client";

import { useCallback, useState } from "react";
import { X, Loader2, Play } from "lucide-react";
import Link from "next/link";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { useCreateLobby } from "@/features/quizzes/hooks/use-create-lobby";
import { useFullQuiz } from "@/features/quizzes/hooks/use-full-quiz";
import { useQuizSessions } from "@/features/quizzes/hooks/use-quiz-sessions";
import { QuestionsPane } from "./quiz-details-modal-questions-pane";
import { StatsPane } from "./quiz-details-modal-stats-pane";

interface QuizDetailsModalProps {
	quiz: QuizWithQuestions;
	onClose: () => void;
}

export function QuizDetailsModal({ quiz, onClose }: QuizDetailsModalProps) {
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);
	const [activeTab, setActiveTab] = useState<"questions" | "stats">(
		"questions"
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

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={onClose}>
			<div
				className="relative w-full max-w-5xl min-h-[500px] h-[85vh] overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-2xl flex flex-col"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
					<h3 className="text-xl font-semibold text-white truncate pr-4">
						{quiz.title || "Untitled Quiz"}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shrink-0">
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
						}`}>
						Questions
					</button>
					<button
						type="button"
						onClick={handleStatsTabClick}
						className={`flex-1 py-3 text-sm font-medium transition-colors ${
							activeTab === "stats"
								? "text-indigo-400 border-b-2 border-indigo-400"
								: "text-gray-400 hover:text-white"
						}`}>
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
						className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
						Edit quiz
					</Link>
					<button
						type="button"
						disabled={isPending}
						onClick={() => createLobby()}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
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
