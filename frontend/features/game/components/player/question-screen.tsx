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
		<div className="flex flex-col h-full bg-gray-100">
			{/* Header: Progress & Timer */}
			<div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
				<div className="flex items-center gap-3">
					<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
						{questionIndex + 1}/{totalQuestions}
					</span>
					<div className="text-sm font-medium text-gray-500 hidden sm:block">
						Quiz in progress
					</div>
				</div>

				{/* Timer Countdown */}
				<div className="flex items-center gap-2">
					<span
						className={`font-bold text-xl ${
							timeLeft <= 5
								? "text-red-500 animate-pulse"
								: "text-gray-700"
						}`}>
						{timeLeft}
					</span>
					<span className="text-xs text-gray-400 uppercase font-semibold">
						sec
					</span>
				</div>
			</div>

			{/* Progress Bar Line */}
			<div className="w-full h-2 bg-gray-200">
				<div
					className="h-full bg-purple-600 transition-all duration-100 ease-linear"
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>

			{/* Question Body */}
			<div className="flex-1 p-4 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
				<div className="bg-white p-6 rounded-xl shadow-sm border mb-6 w-full text-center">
					<h2 className="text-xl font-bold text-gray-800">
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
									? "ring-4 ring-offset-2 ring-indigo-500"
									: ""
							}
						/>
					))}
				</div>
			</div>

			{/* Status Footer */}
			{selectedOptionId && (
				<div className="p-4 bg-indigo-50 text-center text-indigo-700 font-medium animate-pulse">
					Answer submitted! Waiting for results...
				</div>
			)}
		</div>
	);
}
