"use client";

import { QuizFullDetails } from "@/lib/types/quiz";
import { useState, useMemo } from "react";
import QuestionNavList from "./question-nav-list";
import QuestionEditor from "./question-editor";
import QuestionSettingsSidebar from "./question-settings-sidebar";
import Header from "./header";
import { useDeleteQuestion } from "@/hooks/quiz-mutation";

interface QuizEditorProps {
	quiz: QuizFullDetails;
}

export default function QuizEditor({ quiz }: QuizEditorProps) {
	const [activeQuestionId, setActiveQuestionId] = useState<number>(
		quiz.questions[0].id
	);
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);

	const sortedQuestions = useMemo(() => {
		return [...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder);
	}, [quiz.questions]);

	const activeQuestion =
		sortedQuestions.find((q) => q.id === activeQuestionId) ||
		sortedQuestions[0];

	const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuestion(
		activeQuestion,
		{
			onSuccess: () => {
				const currentIndex = sortedQuestions.findIndex(
					(q) => q.id === activeQuestionId
				);
				let nextQuestion;

				if (currentIndex > 0) {
					nextQuestion = sortedQuestions[currentIndex - 1];
				} else {
					nextQuestion = sortedQuestions[currentIndex + 1];
				}

				setActiveQuestionId(nextQuestion.id);
			},
		}
	);

	const canDelete = sortedQuestions.length > 1;

	return (
		<div className="flex flex-col h-screen text-white">
			<Header quiz={quiz} />

			<div className="flex-1 grid grid-cols-6 grid-rows-1 overflow-hidden">
				<div className="col-span-1 flex flex-col border-r border-gray-700 bg-gray-800">
					<QuestionNavList
						questions={sortedQuestions}
						quizId={quiz.id}
						activeQuestionId={activeQuestionId}
						onQuestionSelect={setActiveQuestionId}
					/>
				</div>

				<div className="col-span-5 flex overflow-hidden">
					<div className="flex-1 overflow-y-auto">
						<QuestionEditor question={activeQuestion} />
					</div>

					<QuestionSettingsSidebar
						question={activeQuestion}
						isOpen={isSettingsOpen}
						onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
						onDelete={deleteQuestion}
						isDeleting={isDeleting}
						canDelete={canDelete}
					/>
				</div>
			</div>
		</div>
	);
}
