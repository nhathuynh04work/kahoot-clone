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
import { QuestionNavList } from "./question-nav-list";
import { QuestionEditor } from "./question-editor";
import { QuestionSettingsSidebar } from "./question-settings-sidebar";
import { Header } from "./header";
import { useUpdateQuiz } from "@/features/quizzes/hooks/use-quiz-mutations";
import { toast } from "sonner";
import { MobileQuestionBar } from "./mobile-question-bar";

interface QuizEditorProps {
	quiz: QuizFullDetails;
	maxQuestionsPerQuiz: number;
	canUseVipQuestionTypes: boolean;
}

export function QuizEditor({
	quiz,
	maxQuestionsPerQuiz,
	canUseVipQuestionTypes,
}: QuizEditorProps) {
	const methods = useForm<QuizFullDetails>({
		defaultValues: {
			...quiz,
			questions: [...quiz.questions]
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map((q) => ({
					...q,
					type: q.type ?? "MULTIPLE_CHOICE",
					onlyOneCorrect: q.onlyOneCorrect !== false,
					caseSensitive: q.caseSensitive === true,
						rangeProximity: q.rangeProximity ?? 0,
				})),
		},
		mode: "onChange",
	});

	const { control, formState } = methods;

	const { remove, append, insert, move } = useFieldArray({
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
	const [isMobileAiPanelOpen, setIsMobileAiPanelOpen] = useState(false);

	const questions = useWatch({ control, name: "questions" }) || [];

	const activeIndex = questions.findIndex((q) => q.id === activeQuestionId);
	const activeQuestion = questions[activeIndex] || questions[0];

	const handleAddQuestion = () => {
		if (questions.length >= maxQuestionsPerQuiz) {
			toast.error(
				`You can add at most ${maxQuestionsPerQuiz} questions per quiz.`
			);
			return;
		}

		const newId = Date.now() * -1;

		const lastSortOrder =
			questions.length > 0
				? questions[questions.length - 1].sortOrder
				: 0;

		append({
			id: newId,
			quizId: quiz.id,
			text: "",
			timeLimit: 20000,
			points: 1000,
			imageUrl: "",
			sortOrder: lastSortOrder + 1,
			type: "MULTIPLE_CHOICE",
			onlyOneCorrect: true,
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

	const normalizeSortOrders = () => {
		const current = methods.getValues("questions") || [];
		current.forEach((q, i) => {
			methods.setValue(`questions.${i}.sortOrder`, i, {
				shouldDirty: true,
			});
		});
	};

	const handleDuplicateQuestion = () => {
		const source = activeQuestion;
		if (!source) return;

		if (questions.length >= maxQuestionsPerQuiz) {
			toast.error(
				`You can add at most ${maxQuestionsPerQuiz} questions per quiz.`
			);
			return;
		}

		const newId = Date.now() * -1;
		const baseOptionId = newId * 10;

		const duplicatedOptions = (source.options || [])
			.sort((a, b) => a.sortOrder - b.sortOrder)
			.map((opt, i) => ({
				...opt,
				id: baseOptionId - i,
				questionId: newId,
				sortOrder: i,
			}));

		const duplicatedQuestion = {
			...source,
			id: newId,
			quizId: quiz.id,
			text: source.text ?? "",
			imageUrl: source.imageUrl ?? "",
			sortOrder: activeIndex + 1,
			type: source.type ?? "MULTIPLE_CHOICE",
			onlyOneCorrect: source.onlyOneCorrect !== false,
			caseSensitive: source.caseSensitive === true,
			options: duplicatedOptions,
		};

		insert(activeIndex + 1, duplicatedQuestion);
		normalizeSortOrders();
		setActiveQuestionId(newId);
	};

	const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || fromIndex >= questions.length) return;
		if (toIndex < 0 || toIndex >= questions.length) return;

		move(fromIndex, toIndex);
		normalizeSortOrders();
	};

	return (
		<FormProvider {...methods}>
			<div className="flex flex-col h-dvh bg-(--app-bg) text-(--app-fg)">
				<Header
					isSaving={isSaving}
					onAiPanelOpenChange={setIsMobileAiPanelOpen}
				/>

				<div className="flex-1 grid grid-cols-6 grid-rows-1 overflow-hidden">
					<div className="hidden md:flex col-span-1 flex-col border-r border-(--app-border) bg-(--app-surface-muted)">
						<QuestionNavList
							questions={questions}
							activeQuestionId={activeQuestionId}
							onQuestionSelect={setActiveQuestionId}
							onAddQuestion={handleAddQuestion}
							onMoveQuestion={handleMoveQuestion}
						/>
					</div>

					<div className="col-span-6 md:col-span-5 flex min-h-0 overflow-hidden">
						<div className="flex-1 min-h-0 overflow-y-auto pb-24 md:pb-0">
							{activeQuestion && (
								<QuestionEditor
									questionIndex={activeIndex}
									canDelete={questions.length > 1}
									onDelete={handleDeleteQuestion}
									onDuplicate={handleDuplicateQuestion}
									canUseVipQuestionTypes={canUseVipQuestionTypes}
								/>
							)}
						</div>

						{activeQuestion && (
							<div className="hidden md:block h-full min-h-0 shrink-0">
								<QuestionSettingsSidebar
									key={activeIndex}
									questionIndex={activeIndex}
									isOpen={isSettingsOpen}
									onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
									onDelete={handleDeleteQuestion}
									onDuplicate={handleDuplicateQuestion}
									canDelete={questions.length > 1}
									canUseVipQuestionTypes={canUseVipQuestionTypes}
									variant="desktopSidebar"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Mobile: bottom sticky question bar */}
				<div className="md:hidden">
					<MobileQuestionBar
						questions={questions}
						activeQuestionId={activeQuestionId}
						onSelectQuestion={setActiveQuestionId}
						onAddQuestion={handleAddQuestion}
						hidden={isMobileAiPanelOpen}
					/>
				</div>
			</div>
		</FormProvider>
	);
}
