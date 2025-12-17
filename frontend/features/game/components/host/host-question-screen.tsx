"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";
import { useEffect, useState } from "react";
import { Clock, Users } from "lucide-react";

interface HostQuestionScreenProps {
	currentQuestion: QuestionWithOptions;
	currentQuestionIndex: number;
	totalQuestions: number;
	totalAnswerCount: number;
	onTimeUp: () => void;
}

const getOptionColor = (index: number) => {
	// Semantic colors for gameplay logic
	const colors = [
		"bg-red-500 border-red-600",
		"bg-blue-500 border-blue-600",
		"bg-yellow-500 border-yellow-600",
		"bg-green-500 border-green-600",
	];
	return colors[index % colors.length];
};

export const HostQuestionScreen = ({
	currentQuestion,
	currentQuestionIndex,
	totalQuestions,
	totalAnswerCount,
	onTimeUp,
}: HostQuestionScreenProps) => {
	const [time, setTime] = useState(currentQuestion.timeLimit);

	useEffect(() => {
		if (time <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			setTime((prev) => Math.max(0, prev - 100));
		}, 100);

		return () => clearInterval(timer);
	}, [onTimeUp, time]);

	const percentage = (time / currentQuestion.timeLimit) * 100;
	const secondsLeft = Math.ceil(time / 1000);

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 p-6 gap-6">
			{/* Top Bar Info */}
			<div className="flex justify-between items-center text-gray-400 text-sm font-medium">
				<span className="bg-gray-800 px-3 py-1 rounded-md border border-gray-700">
					Question {currentQuestionIndex + 1} / {totalQuestions}
				</span>
				<div className="flex items-center gap-2">
					<Users size={16} />
					<span>{totalAnswerCount} Answers</span>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col items-center justify-center gap-8">
				{/* Question Text */}
				<h2 className="text-3xl md:text-4xl font-bold text-center text-white max-w-4xl leading-tight">
					{currentQuestion.text}
				</h2>

				{/* Timer Display */}
				<div className="flex flex-col items-center gap-2 w-full max-w-md">
					<div className="flex items-center gap-3 text-2xl font-bold text-white">
						<Clock className="text-indigo-400" size={32} />
						<span>{secondsLeft}</span>
					</div>
					{/* Progress Bar */}
					<div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
						<div
							className="h-full bg-indigo-500 transition-all ease-linear duration-100"
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Options Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[250px]">
				{currentQuestion.options.map((o, i) => (
					<div
						key={o.id}
						className={`${getOptionColor(
							i
						)} border-b-4 rounded-lg p-6 flex items-center shadow-sm`}>
						<div className="bg-black/20 w-8 h-8 flex items-center justify-center rounded text-white font-bold mr-4 text-sm">
							{String.fromCharCode(65 + i)}
						</div>
						<span className="text-white text-xl font-semibold drop-shadow-sm">
							{o.text}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
