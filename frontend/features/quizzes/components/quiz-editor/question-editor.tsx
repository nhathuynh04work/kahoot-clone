"use client";

import { useFormContext } from "react-hook-form";
import { QuestionTextInput } from "./question-text-input";
import { ImageUploader } from "./image-uploader";
import { OptionsGrid } from "./options-grid";
import { QuizFullDetails } from "@/features/quizzes/types";
import { QuestionTypeFields } from "./question-type-fields";
import { useState } from "react";
import { QuestionSettingsModal } from "./question-settings-modal";

interface QuestionEditorProps {
	questionIndex: number;
	canDelete: boolean;
	onDelete: () => void;
	onDuplicate: () => void;
	canUseVipQuestionTypes: boolean;
}

export function QuestionEditor({
	questionIndex,
	canDelete,
	onDelete,
	onDuplicate,
	canUseVipQuestionTypes,
}: QuestionEditorProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const question = watch(`questions.${questionIndex}`);
	const qType = question?.type ?? "MULTIPLE_CHOICE";
	const [isQuestionSettingsOpen, setIsQuestionSettingsOpen] = useState(false);

	if (!question) return null;

	const showOptionsGrid =
		qType === "MULTIPLE_CHOICE" || qType === "TRUE_FALSE";

	return (
		<div className="flex flex-col items-center p-4 sm:p-6 md:p-10 bg-(--app-bg) gap-6 sm:gap-10">
			<QuestionTextInput
				key={`text-${questionIndex}`}
				questionIndex={questionIndex}
				onOpenQuestionSettings={() => setIsQuestionSettingsOpen(true)}
			/>

			<ImageUploader
				key={`image-${questionIndex}`}
				questionIndex={questionIndex}
			/>

			<QuestionTypeFields questionIndex={questionIndex} />

			{showOptionsGrid ? (
				<OptionsGrid
					key={`options-${questionIndex}`}
					questionIndex={questionIndex}
				/>
			) : null}

			<QuestionSettingsModal
				open={isQuestionSettingsOpen}
				onClose={() => setIsQuestionSettingsOpen(false)}
				questionIndex={questionIndex}
				canDelete={canDelete}
				onDelete={() => {
					onDelete();
					setIsQuestionSettingsOpen(false);
				}}
				onDuplicate={() => {
					onDuplicate();
					setIsQuestionSettingsOpen(false);
				}}
				canUseVipQuestionTypes={canUseVipQuestionTypes}
			/>
		</div>
	);
}
