"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { QuizFullDetails, QuizWithQuestions, QuestionWithOptions } from "@/features/quizzes/types";
import { QuestionPreview } from "./question-preview";

export type QuestionsPaneProps = {
	quiz: QuizWithQuestions;
	fullQuiz: QuizFullDetails | null;
	questionsLoading: boolean;
};

export function QuestionsPane({
	quiz,
	fullQuiz,
	questionsLoading,
}: QuestionsPaneProps) {
	const [questionIndex, setQuestionIndex] = useState(0);

	const questions = useMemo(() => {
		const base = fullQuiz ? fullQuiz.questions : quiz.questions;
		return [...base].sort((a, b) => a.sortOrder - b.sortOrder);
	}, [fullQuiz, quiz.questions]);

	const currentQuestion = questions[questionIndex];

	const canGoPrev = questionIndex > 0;
	const canGoNext = questionIndex < questions.length - 1;

	return (
		<div className="h-full min-h-0 flex flex-col gap-4">
			{questionsLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
				</div>
			) : questions.length === 0 ? (
				<p className="text-gray-400 text-center py-8">
					No questions yet.
				</p>
			) : (
				<>
					<div className="flex items-stretch gap-2 min-h-0 flex-1">
						<button
							type="button"
							onClick={() =>
								setQuestionIndex((i) => (i > 0 ? i - 1 : i))
							}
							disabled={!canGoPrev}
							className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600">
							<ChevronLeft className="w-5 h-5" />
						</button>
						<div className="flex-1 min-w-0 min-h-0 bg-gray-900/50 rounded-lg p-4 flex flex-col">
							<p className="text-gray-400 text-xs mb-3 text-center shrink-0">
								Question {questionIndex + 1} of {questions.length}
							</p>
							<div className="min-h-0 overflow-auto">
								<QuestionPreview
									question={currentQuestion}
									options={
										fullQuiz
											? (
													currentQuestion as QuestionWithOptions
												).options
											: null
									}
								/>
							</div>
						</div>
						<button
							type="button"
							onClick={() =>
								setQuestionIndex((i) =>
									i < questions.length - 1 ? i + 1 : i
								)
							}
							disabled={!canGoNext}
							className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600">
							<ChevronRight className="w-5 h-5" />
						</button>
					</div>
					<div className="flex justify-center gap-1">
						{questions.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setQuestionIndex(i)}
								className={`w-2 h-2 rounded-full transition-colors ${
									i === questionIndex
										? "bg-indigo-500"
										: "bg-gray-600 hover:bg-gray-500"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

