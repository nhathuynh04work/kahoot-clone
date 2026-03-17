"use client";

import { useFormContext } from "react-hook-form";
import { useCallback, useRef } from "react";

export default function QuestionTextInput({
	questionIndex,
}: {
	questionIndex: number;
}) {
	const { register } = useFormContext();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const adjustHeight = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, []);

	const { ref, ...rest } = register(`questions.${questionIndex}.text`);
	const setRefs = useCallback(
		(el: HTMLTextAreaElement | null) => {
			textareaRef.current = el;
			ref(el);
			if (el) adjustHeight();
		},
		[ref, adjustHeight]
	);

	return (
		<div className="w-full max-w-2xl">
			<label htmlFor={`q-${questionIndex}-text`} className="sr-only">
				Question Text
			</label>
			<textarea
				id={`q-${questionIndex}-text`}
				ref={setRefs}
				rows={1}
				className="w-full min-h-14 p-4 bg-gray-900 border border-gray-700 rounded-md text-white text-xl text-center font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none overflow-hidden"
				placeholder="Start typing your question..."
				autoComplete="off"
				onInput={adjustHeight}
				{...rest}
			/>
		</div>
	);
}
