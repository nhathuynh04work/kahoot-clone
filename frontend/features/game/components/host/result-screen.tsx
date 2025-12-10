"use client";

import { Option } from "@/features/quizzes/types";
import OptionButton from "@/features/game/components/common/option-button";

interface HostResultScreenProps {
	question: {
		text: string;
		options: Option[];
	};
	stats: Record<number, number>;
	correctOptionId: number;
	onNext: () => void;
}

export default function HostResultScreen({
	question,
	stats,
	correctOptionId,
	onNext,
}: HostResultScreenProps) {
	const maxCount = Math.max(...Object.values(stats), 1);

	return (
		<div className="flex flex-col h-full w-full max-w-6xl mx-auto p-6 space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold text-gray-800">Results</h2>
				<button
					onClick={onNext}
					className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">
					Next Question
				</button>
			</div>

			{/* Question Text */}
			<div className="bg-white p-6 rounded-xl shadow-sm border text-center">
				<h1 className="text-2xl font-bold text-gray-900">
					{question.text}
				</h1>
			</div>

			{/* Bar Chart Area */}
			<div className="flex-1 flex items-end justify-center gap-6 px-10 pb-10 min-h-[300px]">
				{question.options.map((option, index) => {
					const count = stats[option.id] || 0;
					const percentage = (count / maxCount) * 100;
					const isCorrect = option.id === correctOptionId;

					return (
						<div
							key={option.id}
							className="flex flex-col items-center flex-1 h-full justify-end group">
							{/* Count Label */}
							<span
								className={`mb-2 font-bold text-xl ${
									isCorrect
										? "text-green-500"
										: "text-gray-700"
								}`}>
								{count}
							</span>

							{/* The Bar */}
							<div
								className={`w-full rounded-t-lg transition-all duration-1000 ease-out relative ${
									isCorrect
										? "bg-green-500 opacity-100"
										: "bg-red-400 opacity-50"
								}`}
								style={{
									height: `${percentage}%`,
									minHeight: "20px",
								}}></div>

							{/* Option Label (A/B/C/D Style) */}
							<div className="mt-4 w-full">
								<OptionButton
									index={index}
									option={option}
									disabled
									className={`h-16 w-full opacity-100 ${
										isCorrect ? "ring-4 ring-green-500" : ""
									}`}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
