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
	const counts = Object.values(stats).map(Number);
	const maxCount = Math.max(...counts, 1);

	return (
		<div className="flex flex-col h-full w-full max-w-7xl mx-auto p-6 space-y-6 text-white">
			{/* Header */}
			<div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
				<h2 className="text-2xl font-bold text-white tracking-tight">
					Results
				</h2>
				<button
					onClick={onNext}
					className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg active:scale-95">
					Next Question
				</button>
			</div>

			{/* Question Text */}
			<div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-center">
				<h1 className="text-3xl font-bold text-white leading-tight">
					{question.text}
				</h1>
			</div>

			{/* Chart Area */}
			<div className="flex-1 min-h-[400px] w-full flex flex-row items-end justify-center gap-4 sm:gap-8 pb-4">
				{question.options.map((option, index) => {
					const count = stats[option.id] || 0;
					const percentage = (count / maxCount) * 100;
					const isCorrect = option.id === correctOptionId;

					return (
						<div
							key={option.id}
							className="flex flex-col items-center justify-end h-full flex-1 group max-w-[200px]">
							{/* Count Label */}
							<div className="mb-2 transition-transform group-hover:-translate-y-1">
								<span
									className={`font-black text-2xl ${
										isCorrect
											? "text-green-400"
											: "text-gray-400"
									}`}>
									{count}
								</span>
							</div>

							{/* Bar Track */}
							<div className="w-full flex-1 max-h-[50vh] flex items-end justify-center relative rounded-t-lg bg-gray-800/30 overflow-hidden">
								{/* The Bar */}
								<div
									className={`w-full rounded-t-lg transition-all duration-1000 ease-out relative ${
										isCorrect
											? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
											: "bg-red-500/40"
									}`}
									style={{
										height:
											count === 0
												? "0%"
												: `${percentage}%`,

										minHeight: count > 0 ? "20px" : "0px",
									}}
								/>
							</div>

							{/* Option Button / Label */}
							<div className="mt-4 w-full">
								<OptionButton
									index={index}
									option={option}
									disabled
									className={`h-16 w-full opacity-100 text-lg ${
										isCorrect
											? "ring-4 ring-green-500 ring-offset-2 ring-offset-gray-900"
											: "opacity-50 grayscale"
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
