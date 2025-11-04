"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import {
	useAddOption,
	useUpdateOption,
	useUpdateQuestion,
} from "@/app/hooks/quiz-mutation";
import QuestionTextInput from "./question-text-input";
import ImageUploader from "./image-uploader";
import OptionsGrid from "./options-grid";

interface QuestionEditorProps {
	question: QuestionWithOptions;
}

export default function QuestionEditor({ question }: QuestionEditorProps) {
	const { mutate: updateQuestion } = useUpdateQuestion(question);
	const { mutate: updateOption } = useUpdateOption(question);
	const { mutate: addOption, isPending: isAddingOption } =
		useAddOption(question);

	if (!question) {
		return <NoQuestionSelected />;
	}

	return (
		<div className="h-full flex flex-col items-center p-8 overflow-y-auto bg-gray-800">
			<QuestionTextInput
				question={question}
				onMutate={(text) => updateQuestion({ text })}
			/>

			<ImageUploader question={question} />

			<OptionsGrid
				options={question.options.sort(
					(a, b) => a.sortOrder - b.sortOrder
				)}
				onOptionMutate={updateOption}
				onAddOptionMutate={addOption}
				isAddingOption={isAddingOption}
			/>
		</div>
	);
}

function NoQuestionSelected() {
	return (
		<div className="h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400">
			<p className="text-xl font-semibold">No Question Selected</p>
			<p>Select a question from the list to start editing.</p>
		</div>
	);
}
