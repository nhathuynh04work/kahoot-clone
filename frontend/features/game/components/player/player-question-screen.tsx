"use client";

import { useState } from "react";
import { QuestionWithOptions } from "@/features/quizzes/types";
import { Circle, Square, Triangle, Hexagon } from "lucide-react";

interface PlayerQuestionScreenProps {
	question: QuestionWithOptions;
	onSelectOption: (optionId: number) => void;
	onSubmitText: (text: string) => void;
	onSubmitNumeric: (value: number) => void;
}

export const PlayerQuestionScreen = ({
	question,
	onSelectOption,
	onSubmitText,
	onSubmitNumeric,
}: PlayerQuestionScreenProps) => {
	const qType = question.type ?? "MULTIPLE_CHOICE";
	const [textDraft, setTextDraft] = useState("");
	const [numDraft, setNumDraft] = useState("");

	const icons = [Triangle, Hexagon, Circle, Square];
	const styles = [
		"bg-red-500 hover:bg-red-600 active:bg-red-700",
		"bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
		"bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700",
		"bg-green-500 hover:bg-green-600 active:bg-green-700",
	];

	return (
		<div className="min-h-screen bg-gray-900 p-4 flex flex-col">
			<div className="bg-gray-800 border-b border-gray-700 p-4 -mx-4 -mt-4 mb-4 text-center">
				<p className="text-white font-medium text-sm md:text-base line-clamp-4">
					{question.text}
				</p>
				{qType === "SHORT_ANSWER" ? (
					<p className="text-xs text-indigo-300 mt-2">Short answer</p>
				) : null}
				{qType === "NUMERIC_RANGE" ? (
					<p className="text-xs text-indigo-300 mt-2">Enter a number</p>
				) : null}
			</div>

			{qType === "MULTIPLE_CHOICE" ? (
				<div className="flex-1 grid grid-cols-2 gap-4">
					{question.options.map((o, i) => {
						const Icon = icons[i % 4];
						return (
							<button
								key={o.id}
								type="button"
								onClick={() => onSelectOption(o.id)}
								className={`${
									styles[i % 4]
								} rounded-xl flex flex-col items-center justify-center p-4 transition-transform active:scale-95 shadow-md`}>
								<Icon
									size={48}
									className="text-white/80 mb-2 fill-current"
								/>
								<span className="text-white font-bold text-lg leading-tight text-center drop-shadow-sm">
									{o.text}
								</span>
							</button>
						);
					})}
				</div>
			) : null}

			{qType === "SHORT_ANSWER" ? (
				<div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
					<input
						type="text"
						value={textDraft}
						onChange={(e) => setTextDraft(e.target.value)}
						className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white text-lg"
						placeholder="Your answer"
						autoComplete="off"
					/>
					<button
						type="button"
						onClick={() => onSubmitText(textDraft)}
						disabled={!textDraft.trim()}
						className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-semibold text-white">
						Submit
					</button>
				</div>
			) : null}

			{qType === "NUMERIC_RANGE" ? (
				<div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
					<input
						type="number"
						step="any"
						value={numDraft}
						onChange={(e) => setNumDraft(e.target.value)}
						className="w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white text-lg"
						placeholder="0"
					/>
					<button
						type="button"
						onClick={() => {
							const n = parseFloat(numDraft);
							if (Number.isFinite(n)) onSubmitNumeric(n);
						}}
						disabled={!Number.isFinite(parseFloat(numDraft))}
						className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-semibold text-white">
						Submit
					</button>
				</div>
			) : null}
		</div>
	);
};
