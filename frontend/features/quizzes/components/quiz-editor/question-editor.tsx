"use client";

import { useFormContext } from "react-hook-form";
import { QuestionTextInput } from "./question-text-input";
import { ImageUploader } from "./image-uploader";
import { OptionsGrid } from "./options-grid";
import { QuizFullDetails } from "@/features/quizzes/types";

interface QuestionEditorProps {
	questionIndex: number;
}

export function QuestionEditor({ questionIndex }: QuestionEditorProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const question = watch(`questions.${questionIndex}`);

	if (!question) return null;

	return (
		<div className="flex flex-col items-center p-8 md:p-10 bg-gray-900 gap-10">
			<QuestionTextInput
				key={`text-${questionIndex}`}
				questionIndex={questionIndex}
			/>

			<ImageUploader
				key={`image-${questionIndex}`}
				questionIndex={questionIndex}
			/>

			<OptionsGrid
				key={`options-${questionIndex}`}
				questionIndex={questionIndex}
			/>
		</div>
	);
}
