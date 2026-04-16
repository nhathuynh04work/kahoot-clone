"use client";

import { useFormContext } from "react-hook-form";
import { useCallback, useRef } from "react";
import { MoreVertical } from "lucide-react";

export function QuestionTextInput({
	questionIndex,
	onOpenQuestionSettings,
}: {
	questionIndex: number;
	onOpenQuestionSettings?: () => void;
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
			<div className="flex items-start gap-2">
				<textarea
					id={`q-${questionIndex}-text`}
					ref={setRefs}
					rows={1}
					className="flex-1 min-h-14 p-4 bg-(--app-bg) border border-(--app-border) rounded-md text-(--app-fg) text-xl text-center font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none overflow-hidden"
					placeholder="Start typing your question..."
					autoComplete="off"
					onInput={adjustHeight}
					{...rest}
				/>

				<button
					type="button"
					onClick={() => onOpenQuestionSettings?.()}
					className="md:hidden shrink-0 h-14 w-12 rounded-md border border-(--app-border) bg-(--app-surface-muted) hover:bg-(--app-surface) text-(--app-fg) transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-bg)"
					aria-label="Question settings"
				>
					<MoreVertical className="w-5 h-5" aria-hidden />
				</button>
			</div>
		</div>
	);
}
