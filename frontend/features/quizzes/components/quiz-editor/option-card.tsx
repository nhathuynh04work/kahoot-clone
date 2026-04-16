"use client";

import { useFormContext } from "react-hook-form";
import { useCallback, useRef } from "react";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";
import { optionColors } from "@/lib/option-colors";

interface RealOptionCardProps {
	questionIndex: number;
	optionIndex: number;
	onDelete: () => void;
	/** True/False type: fixed labels, no text editing. */
	isTrueFalse?: boolean;
}

function McOptionTextarea({
	questionIndex,
	optionIndex,
	onDelete,
}: {
	questionIndex: number;
	optionIndex: number;
	onDelete: () => void;
}) {
	const { register } = useFormContext<QuizFullDetails>();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const adjustHeight = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, []);

	const { onChange, onBlur, name, ref } = register(
		`questions.${questionIndex}.options.${optionIndex}.text`
	);

	const setRefs = useCallback(
		(el: HTMLTextAreaElement | null) => {
			textareaRef.current = el;
			ref(el);
			if (el) adjustHeight();
		},
		[ref, adjustHeight]
	);

	return (
		<textarea
			name={name}
			ref={setRefs}
			rows={1}
			onChange={(e) => {
				onChange(e);
				adjustHeight();
			}}
			onBlur={(e) => {
				onBlur(e);
				if (!e.target.value.trim()) {
					onDelete();
				}
			}}
			onInput={adjustHeight}
			placeholder={`Option ${optionIndex + 1}`}
			className="grow min-h-6 py-0.5 bg-transparent text-(--app-fg) text-lg font-medium placeholder:text-(--app-fg-muted)/70 focus:outline-none resize-none overflow-hidden"
			autoComplete="off"
		/>
	);
}

export function RealOptionCard({
	questionIndex,
	optionIndex,
	onDelete,
	isTrueFalse = false,
}: RealOptionCardProps) {
	const { watch, setValue, getValues } = useFormContext<QuizFullDetails>();

	const onlyOneCorrect =
		watch(`questions.${questionIndex}.onlyOneCorrect`) !== false;

	const isCorrect = watch(
		`questions.${questionIndex}.options.${optionIndex}.isCorrect`
	);
	const colorClass = optionColors[optionIndex % 4];

	const handleToggleCorrect = () => {
		if (isCorrect) {
			setValue(
				`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
				false,
				{ shouldDirty: true }
			);

			return;
		}

		if (onlyOneCorrect) {
			const currentOptions = getValues(`questions.${questionIndex}.options`);

			currentOptions.forEach((_, idx) => {
				if (idx !== optionIndex) {
					setValue(
						`questions.${questionIndex}.options.${idx}.isCorrect`,
						false,
						{ shouldDirty: true }
					);
				}
			});
		}

		setValue(
			`questions.${questionIndex}.options.${optionIndex}.isCorrect`,
			true,
			{ shouldDirty: true }
		);
	};

	return (
		<div className="p-4 rounded-md border border-(--app-border) bg-(--app-surface) flex items-start gap-3 shadow-sm group transition-colors focus-within:border-indigo-500/40">
			<div className={`w-10 h-10 rounded-md shrink-0 mt-0.5 ${colorClass}`} />

			{isTrueFalse ? (
				<p className="grow min-h-6 py-0.5 text-(--app-fg) text-lg font-medium">
					{optionIndex === 0 ? "True" : "False"}
				</p>
			) : (
				<McOptionTextarea
					questionIndex={questionIndex}
					optionIndex={optionIndex}
					onDelete={onDelete}
				/>
			)}

			<button
				type="button"
				onClick={handleToggleCorrect}
				className="shrink-0 mt-0.5 transition-transform active:scale-95"
				title={isCorrect ? "Correct answer" : "Mark as correct"}>
				{isCorrect ? (
					<CheckCircle className="w-7 h-7 text-green-500" />
				) : (
					<Circle className="w-7 h-7 text-(--app-fg-muted)/50 hover:text-(--app-fg-muted)" />
				)}
			</button>
		</div>
	);
}

export function PlaceholderOptionCard({
	index,
	onAdd,
	disabled,
}: {
	index: number;
	onAdd: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onAdd}
			disabled={disabled}
			className="w-full h-full p-4 rounded-md border border-(--app-border) bg-(--app-surface-muted) flex items-center gap-3 opacity-50 hover:opacity-100 hover:bg-(--app-surface) transition-all cursor-pointer group disabled:cursor-not-allowed">
			<div
				className={`w-10 h-10 rounded-md ${
					optionColors[index % 4]
				} opacity-50`}
			/>
			<span className="text-(--app-fg-muted)/70 text-lg font-medium group-hover:text-(--app-fg-muted)">
				Add option
			</span>
			<Plus className="ml-auto w-5 h-5 text-(--app-fg-muted)/70" />
		</button>
	);
}
