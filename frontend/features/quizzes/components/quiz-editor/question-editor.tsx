"use client";

import { useFormContext } from "react-hook-form";
import { QuestionTextInput } from "./question-text-input";
import { ImageUploader } from "./image-uploader";
import { OptionsGrid } from "./options-grid";
import { QuizFullDetails } from "@/features/quizzes/types";
import { QuestionTypeFields } from "./question-type-fields";

interface QuestionEditorProps {
	questionIndex: number;
}

export function QuestionEditor({ questionIndex }: QuestionEditorProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const question = watch(`questions.${questionIndex}`);
	const qType = question?.type ?? "MULTIPLE_CHOICE";

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

			<QuestionTypeFields questionIndex={questionIndex} />

			{qType === "MULTIPLE_CHOICE" ? (
				<OptionsGrid
					key={`options-${questionIndex}`}
					questionIndex={questionIndex}
				/>
			) : (
				<p className="text-sm text-gray-500 max-w-xl text-center">
					This question uses typed input during play — no answer options.
				</p>
			)}
		</div>
	);
}
