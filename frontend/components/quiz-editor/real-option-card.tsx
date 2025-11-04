"use client";

import { Option } from "@/lib/types/quiz";
import MutatingInput from "./mutating-input";
import { optionColors } from "./options-grid";
import { CheckCircle, Circle } from "lucide-react";
import { UpdateOptionDto } from "@/lib/dtos/quiz.dto";

interface RealOptionCardProps {
	option: Option;
	index: number;
	onMutate: (data: { optionId: number; payload: UpdateOptionDto }) => void;
}

export default function RealOptionCard({
	option,
	index,
	onMutate,
}: RealOptionCardProps) {
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
				onMutate={(text) =>
					onMutate({
						optionId: option.id,
						payload: { text },
					})
				}
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
