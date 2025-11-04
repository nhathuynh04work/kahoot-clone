"use client";

import { Option } from "@/lib/types/quiz";
import MutatingInput from "./mutating-input";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { CreateOptionDto, UpdateOptionDto } from "@/lib/dtos/quiz.dto";
import { useState } from "react";

const optionColors = [
	"bg-red-800",
	"bg-blue-800",
	"bg-yellow-800",
	"bg-green-800",
];

interface RealOptionCardProps {
	option: Option;
	index: number;
	onMutate: (data: { optionId: number; payload: UpdateOptionDto }) => void;
	onDelete: (data: { optionId: number }) => void;
	optionsCount: number;
}

export function RealOptionCard({
	option,
	index,
	onMutate,
	onDelete,
	optionsCount,
}: RealOptionCardProps) {
	// If new value is an empty string,
	// delete the option if there are > 2 options, otherwise just update it
	function handleTextMutate(newValue: string) {
		if (newValue === "" && optionsCount > 2) {
			onDelete({ optionId: option.id });
		} else {
			onMutate({
				optionId: option.id,
				payload: { text: newValue },
			});
		}
	}

	return (
		<div
			className={`p-4 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-3`}>
			<div
				className={`w-10 h-10 rounded-md ${
					optionColors[index % 4]
				}`}></div>

			<MutatingInput
				type="text"
				className="grow bg-transparent text-white text-lg font-medium placeholder:text-gray-500 focus:outline-none"
				placeholder={`Option ${index + 1}`}
				defaultValue={option.text || ""}
				onMutate={handleTextMutate}
				key={`opt-text-${option.id}`}
			/>

			<button
				className="shrink-0 disabled:opacity-70"
				title={option.isCorrect ? "Correct answer" : "Mark as correct"}
				disabled={option.isCorrect}
				onClick={() => {
					if (!option.isCorrect) {
						onMutate({
							optionId: option.id,
							payload: {
								isCorrect: true,
							},
						});
					}
				}}>
				{option.isCorrect ? (
					<CheckCircle className="w-6 h-6 text-green-500" />
				) : (
					<Circle className="w-6 h-6 text-gray-600 hover:text-gray-400" />
				)}
			</button>
		</div>
	);
}

interface PlaceholderOptionCardProps {
	index: number;
	onAdd: (payload: CreateOptionDto) => void;
	disabled: boolean;
}

export function PlaceholderOptionCard({
	index,
	onAdd,
	disabled,
}: PlaceholderOptionCardProps) {
	const [text, setText] = useState("");

	function handleBlur() {
		const newText = text.trim();
		if (newText) {
			onAdd({ text: newText });
			setText("");
		}
	}

	return (
		<div
			className={`p-4 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-3 
                       opacity-50 focus-within:opacity-100 hover:opacity-100 transition-opacity ${
							disabled ? "opacity-30 cursor-not-allowed" : ""
						}`}>
			<div
				className={`w-10 h-10 rounded-md ${optionColors[index % 4]}`}
			/>

			<input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				onBlur={handleBlur}
				disabled={disabled}
				className="grow bg-transparent text-white text-lg font-medium placeholder:text-gray-500 focus:outline-none"
				placeholder={disabled ? "Adding..." : "Add option"}
			/>
			{!text && <Plus className="w-5 h-5 text-gray-500 shrink-0" />}
		</div>
	);
}
