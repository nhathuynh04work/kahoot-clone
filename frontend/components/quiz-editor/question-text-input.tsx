"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import MutatingInput from "./mutating-input";

export default function QuestionTextInput({
	question,
	onMutate,
}: {
	question: QuestionWithOptions;
	onMutate: (text: string) => void;
}) {
	return (
		<div className="w-full mb-6">
			<label htmlFor="questionText" className="sr-only">
				Question Text
			</label>
			<MutatingInput
				id="questionText"
				type="text"
				className="w-full p-4 bg-gray-900 border border-gray-700 rounded-md text-white text-xl text-center font-semibold"
				placeholder="Start typing your question..."
				defaultValue={question.text || ""}
				onMutate={onMutate}
				key={`q-text-${question.id}`}
			/>
		</div>
	);
}
