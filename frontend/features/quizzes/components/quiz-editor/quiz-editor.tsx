"use client";

import { QuizFullDetails } from "@/features/quizzes/types";
import { useState, useEffect } from "react";
import {
	useForm,
	FormProvider,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import { useDebounce } from "use-debounce";
import QuestionNavList from "./question-nav-list";
import QuestionEditor from "./question-editor";
import QuestionSettingsSidebar from "./question-settings-sidebar";
import Header from "./header";
import { useUpdateQuiz } from "@/features/quizzes/hooks/use-quiz-mutations";

interface QuizEditorProps {
	quiz: QuizFullDetails;
}

export default function QuizEditor({ quiz }: QuizEditorProps) {
	const methods = useForm<QuizFullDetails>({
		defaultValues: {
			...quiz,
			questions: [...quiz.questions].sort(
				(a, b) => a.sortOrder - b.sortOrder
			),
		},
		mode: "onChange",
	});

	const { control, formState } = methods;

	const { remove, append } = useFieldArray({
		control,
		name: "questions",
		keyName: "fieldId",
	});

	const formValues = useWatch({ control });
	const [debouncedQuizData] = useDebounce(formValues, 1500);

	const { mutate: saveQuiz, isPending: isSaving } = useUpdateQuiz();

	useEffect(() => {
		if (formState.isDirty) {
			saveQuiz(debouncedQuizData as QuizFullDetails);
		}
	}, [debouncedQuizData, formState.isDirty, saveQuiz]);

	const [activeQuestionId, setActiveQuestionId] = useState<number>(
		quiz.questions[0]?.id
	);
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);

	const questions = useWatch({ control, name: "questions" }) || [];

	const activeIndex = questions.findIndex((q) => q.id === activeQuestionId);
	const activeQuestion = questions[activeIndex] || questions[0];

	const handleAddQuestion = () => {
		const newId = Date.now() * -1;

		const lastSortOrder =
			questions.length > 0
				? questions[questions.length - 1].sortOrder
				: 0;

		append({
			id: newId,
			quizId: quiz.id,
			text: "",
			timeLimit: 20,
			points: 1000,
			imageUrl: "",
			sortOrder: lastSortOrder + 1,
			options: [
				{
					id: Date.now() * -1 - 1,
					questionId: newId,
					text: "Option 1",
					isCorrect: true,
					sortOrder: 0,
				},
				{
					id: Date.now() * -1 - 2,
					questionId: newId,
					text: "Option 2",
					isCorrect: false,
					sortOrder: 1,
				},
			],
		});
		setActiveQuestionId(newId);
	};

	const handleDeleteQuestion = () => {
		if (questions.length <= 1) return;

		const nextIndex = activeIndex > 0 ? activeIndex - 1 : activeIndex + 1;
		const nextId = questions[nextIndex]?.id;

		remove(activeIndex);

		if (nextId) setActiveQuestionId(nextId);
	};

	return (
		<FormProvider {...methods}>
			<div className="flex flex-col h-screen text-white">
				<Header isSaving={isSaving} />

				<div className="flex-1 grid grid-cols-6 grid-rows-1 overflow-hidden">
					<div className="col-span-1 flex flex-col border-r border-gray-700 bg-gray-800">
						<QuestionNavList
							questions={questions}
							activeQuestionId={activeQuestionId}
							onQuestionSelect={setActiveQuestionId}
							onAddQuestion={handleAddQuestion}
						/>
					</div>

					<div className="col-span-5 flex overflow-hidden">
						<div className="flex-1 overflow-y-auto">
							{activeQuestion && (
								<QuestionEditor
									questionIndex={activeIndex}
								/>
							)}
						</div>

						{activeQuestion && (
							<QuestionSettingsSidebar
								questionIndex={activeIndex}
								isOpen={isSettingsOpen}
								onToggle={() =>
									setIsSettingsOpen(!isSettingsOpen)
								}
								onDelete={handleDeleteQuestion}
								canDelete={questions.length > 1}
							/>
						)}
					</div>
				</div>
			</div>
		</FormProvider>
	);
}
