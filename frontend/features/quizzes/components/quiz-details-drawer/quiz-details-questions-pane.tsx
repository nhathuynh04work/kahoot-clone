"use client";

import { useState } from "react";
import type {
	QuizFullDetails,
	QuizWithQuestions,
} from "@/features/quizzes/types";
import { useExpandableList } from "@/features/quizzes/hooks/use-expandable-list";
import { useSortedQuestionsWithOptions } from "@/features/quizzes/hooks/use-sorted-questions";
import { QuizQuestionsHeader } from "./quiz-questions-header";
import { QuizQuestionList } from "./quiz-questions-list";

export type QuizDetailsQuestionsPaneProps = {
	quiz: QuizWithQuestions;
	fullQuiz: QuizFullDetails | null;
	questionsLoading: boolean;
};

export function QuizDetailsQuestionsPane({
	quiz,
	fullQuiz,
	questionsLoading,
}: QuizDetailsQuestionsPaneProps) {
	const [showAnswers, setShowAnswers] = useState(false);
	const { expandedIds, toggle, expandAll, collapseAll } =
		useExpandableList<number>();

	const { questions, getOptions } = useSortedQuestionsWithOptions({
		quiz,
		fullQuiz,
	});

	const handleToggleShowAnswers = () => {
		const next = !showAnswers;
		setShowAnswers(next);
		if (next) {
			expandAll(questions.map((q) => q.id));
		} else {
			collapseAll();
		}
	};

	return (
		<div className="h-full min-h-0 flex flex-col">
			<QuizQuestionsHeader
				count={questions.length}
				showAnswers={showAnswers}
				onToggleShowAnswers={handleToggleShowAnswers}
			/>

			<QuizQuestionList
				questions={questions}
				questionsLoading={questionsLoading}
				expandedIds={expandedIds}
				onToggleExpanded={toggle}
				getOptions={getOptions}
				showAnswers={showAnswers}
			/>
		</div>
	);
}

