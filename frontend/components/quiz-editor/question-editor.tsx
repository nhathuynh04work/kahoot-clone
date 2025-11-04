"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import {
	useAddOption,
	useDeleteOption, // 1. Import useDeleteOption
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
	const { mutate: deleteOption } = useDeleteOption(question);

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
				onOptionDelete={deleteOption}
			/>
		</div>
	);
}
