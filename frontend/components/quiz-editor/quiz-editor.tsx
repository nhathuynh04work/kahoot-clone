"use client";

import { QuizFullDetails } from "@/lib/types/quiz";
import Link from "next/link";
import { useState } from "react";
import QuestionNavList from "./question-nav-list";
import QuestionEditor from "./question-editor";
import QuestionSettingsSidebar from "./question-settings-sidebar";

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
			{/* header */}
			<div className="flex items-center px-4 py-2 border-b border-gray-700 bg-gray-800">
				<Link
					href="/dashboard"
					className="text-3xl mr-24 uppercase font-semibold">
					Kahoot!
				</Link>
				<div className="border border-gray-700 rounded-md pl-5 pr-2 py-2 flex items-center gap-10 bg-gray-900">
					<p className={`${quiz.title ? "" : "text-gray-500"}`}>
						{quiz.title ? quiz.title : "Enter quiz title..."}
					</p>
					<button className="bg-gray-300 text-black px-3 py-1 rounded-sm text-sm font-semibold cursor-pointer">
						Settings
					</button>
				</div>
				<div className="ml-auto flex items-center gap-4">
					<Link
						href={"/dashboard"}
						className="font-semibold text-white bg-indigo-800 hover:bg-indigo-700 rounded-md px-8 py-3 transition-colors">
						Save
					</Link>
				</div>
			</div>

			<div className="flex-1 grid grid-cols-6 grid-rows-1 overflow-hidden">
				<div className="col-span-1 flex flex-col border-r border-gray-700 bg-gray-800">
					<QuestionNavList
						questions={quiz.questions || []}
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
