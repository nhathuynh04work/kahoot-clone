"use client";

import { useFormContext } from "react-hook-form";

export default function QuestionTextInput({
	questionIndex,
}: {
	questionIndex: number;
}) {
	const { register } = useFormContext();

	return (
		<div className="w-full mb-6">
			<label htmlFor={`q-${questionIndex}-text`} className="sr-only">
				Question Text
			</label>
			<input
				id={`q-${questionIndex}-text`}
				type="text"
				className="w-full p-4 bg-gray-900 border border-gray-700 rounded-md text-white text-xl text-center font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
				placeholder="Start typing your question..."
				autoComplete="off"
				{...register(`questions.${questionIndex}.text`)}
			/>
		</div>
	);
}
