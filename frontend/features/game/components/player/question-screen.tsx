"use client";

import { useEffect, useState } from "react";
import OptionButton from "@/features/game/components/common/option-button";
import { Option } from "@/features/quizzes/types";

interface PlayerQuestionScreenProps {
	question: {
		text: string;
		options: Option[];
	};

	questionIndex: number;
	totalQuestions: number;
	timeLimit: number;
	endsAt: number;
	onSubmitAnswer: (optionId: number) => void;
	selectedOptionId: number | null;
}

export default function PlayerQuestionScreen({
	question,
	questionIndex,
	totalQuestions,
	timeLimit,
	endsAt,
	onSubmitAnswer,
	selectedOptionId,
}: PlayerQuestionScreenProps) {
	const [timeLeft, setTimeLeft] = useState(timeLimit / 1000);
	const [progressPercentage, setProgressPercentage] = useState(100);

	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();

			const remainingSeconds = Math.max(
				0,
				Math.ceil((endsAt - now) / 1000)
			);
			setTimeLeft(remainingSeconds);

			const remainingMs = Math.max(0, endsAt - now);
			const percentage = (remainingMs / timeLimit) * 100;
			setProgressPercentage(percentage);

			if (remainingMs <= 0) {
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [endsAt, timeLimit]);

	return (
		<div className="flex flex-col h-full">
			{/* Header: Progress & Timer */}
			<div className="bg-gray-800 p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-700">
				<div className="flex items-center gap-3">
					<span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm font-bold border border-gray-600">
						{questionIndex + 1}/{totalQuestions}
					</span>
					<div className="text-sm font-medium text-gray-400 hidden sm:block">
						Quiz in progress
					</div>
				</div>

				{/* Timer Countdown */}
				<div className="flex items-center gap-2">
					<span
						className={`font-bold text-xl ${
							timeLeft <= 5
								? "text-red-400 animate-pulse"
								: "text-white"
						}`}>
						{timeLeft}
					</span>
					<span className="text-xs text-gray-500 uppercase font-semibold">
						sec
					</span>
				</div>
			</div>

			{/* Progress Bar Line */}
			<div className="w-full h-2 bg-gray-700">
				<div
					className="h-full bg-purple-500 transition-all duration-100 ease-linear"
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>

			{/* Question Body */}
			<div className="flex-1 p-4 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
				<div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700 mb-6 w-full text-center">
					<h2 className="text-xl font-bold text-white">
						{question.text}
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 w-full flex-1">
					{question.options.map((option, index) => (
						<OptionButton
							key={option.id}
							index={index}
							option={option}
							disabled={
								selectedOptionId !== null || timeLeft === 0
							}
							onClick={onSubmitAnswer}
							className={
								selectedOptionId === option.id
									? "ring-4 ring-offset-2 ring-offset-gray-900 ring-indigo-500"
									: ""
							}
						/>
					))}
				</div>
			</div>

			{/* Status Footer */}
			{selectedOptionId && (
				<div className="p-4 bg-indigo-900/50 text-center text-indigo-200 font-medium animate-pulse border-t border-indigo-800">
					Answer submitted! Waiting for results...
				</div>
			)}
		</div>
	);
}
