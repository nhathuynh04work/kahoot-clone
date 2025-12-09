"use client";

import { useFormContext } from "react-hook-form";
import QuestionTextInput from "./question-text-input";
import ImageUploader from "./image-uploader";
import OptionsGrid from "./options-grid";
import { QuizFullDetails } from "@/features/quizzes/types";

interface QuestionEditorProps {
	questionIndex: number;
}

export default function QuestionEditor({ questionIndex }: QuestionEditorProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const question = watch(`questions.${questionIndex}`);

	if (!question) return null;

	return (
		<div className="h-full flex flex-col items-center p-8 overflow-y-auto bg-gray-800">
			<QuestionTextInput questionIndex={questionIndex} />

			<ImageUploader questionIndex={questionIndex} />

			<OptionsGrid questionIndex={questionIndex} />
		</div>
	);
}
