"use client";

import { QuizFullDetails } from "@/lib/types/quiz";
import { useState } from "react";
import QuestionNavList from "./question-nav-list";
import QuestionEditor from "./question-editor";
import QuestionSettingsSidebar from "./question-settings-sidebar";
import Header from "./header";

interface QuizEditorProps {
	quiz: QuizFullDetails;
}

export default function QuizEditor({ quiz }: QuizEditorProps) {
	const [activeQuestionId, setActiveQuestionId] = useState<number>(
		quiz.questions[0].id
	);
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);

	const activeQuestion = quiz.questions.find(
		(q) => q.id === activeQuestionId
	);

	return (
		<div className="flex flex-col h-screen text-white">
			<Header title={quiz.title} />

			<div className="flex-1 grid grid-cols-6 grid-rows-1 overflow-hidden">
				<div className="col-span-1 flex flex-col border-r border-gray-700 bg-gray-800">
					<QuestionNavList
						questions={quiz.questions.sort(
							(a, b) => a.sortOrder - b.sortOrder
						)}
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
					/>
				</div>
			</div>
		</div>
	);
}
