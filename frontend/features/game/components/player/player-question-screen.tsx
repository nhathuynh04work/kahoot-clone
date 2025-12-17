"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";
import { Circle, Square, Triangle, Hexagon } from "lucide-react";

interface PlayerQuestionScreenProps {
	question: QuestionWithOptions;
	onSubmit: (optionId: number) => void;
}

export const PlayerQuestionScreen = ({
	question,
	onSubmit,
}: PlayerQuestionScreenProps) => {
	const icons = [Triangle, Hexagon, Circle, Square];

	const styles = [
		"bg-red-500 hover:bg-red-600 active:bg-red-700",
		"bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
		"bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700",
		"bg-green-500 hover:bg-green-600 active:bg-green-700",
	];

	return (
		<div className="min-h-screen bg-gray-900 p-4 flex flex-col">
			{/* Question Text Preview (Optional on mobile, but good for context) */}
			<div className="bg-gray-800 border-b border-gray-700 p-4 -mx-4 -mt-4 mb-4 text-center">
				<p className="text-white font-medium text-sm md:text-base line-clamp-2">
					{question.text}
				</p>
			</div>

			<div className="flex-1 grid grid-cols-2 gap-4">
				{question.options.map((o, i) => {
					const Icon = icons[i % 4];
					return (
						<button
							key={o.id}
							onClick={() => onSubmit(o.id)}
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
		</div>
	);
};
