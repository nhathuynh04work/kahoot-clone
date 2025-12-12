"use client";

import { useEffect, useState } from "react";
import { QuestionWithOptions } from "@/features/quizzes/types";
import OptionButton from "@/features/game/components/common/option-button";

interface QuestionScreenProps {
	question: QuestionWithOptions;
	answerCount: number;
	totalPlayers: number;
	questionIndex: number;
	totalQuestions: number;
	timeLimit: number;
	endsAt: number;
	onNext?: () => void;
}

export default function QuestionScreen({
	question,
	answerCount,
	totalPlayers,
	questionIndex,
	totalQuestions,
	timeLimit,
	endsAt,
}: QuestionScreenProps) {
	const [timeLeft, setTimeLeft] = useState(timeLimit / 1000);

	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
			setTimeLeft(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [endsAt]);

	return (
		<div className="flex flex-col h-full w-full max-w-6xl mx-auto p-6 space-y-8 text-white">
			{/* HEADER: Question Count & Answer Count */}
			<div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
				<div className="flex items-center gap-4">
					<span className="bg-blue-900/50 text-blue-200 px-4 py-2 rounded-lg font-bold border border-blue-800">
						{answerCount} / {totalPlayers} Answers
					</span>
					<span className="text-gray-400 font-medium">
						Question {questionIndex + 1} of {totalQuestions}
					</span>
				</div>

				{/* TIMER CIRCLE */}
				<div className="flex items-center gap-2">
					<div className="relative w-16 h-16 flex items-center justify-center bg-gray-900 rounded-full border border-gray-700">
						<span className="text-2xl font-bold text-white">
							{timeLeft}
						</span>
						<svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
							<circle
								cx="32"
								cy="32"
								r="28"
								stroke="currentColor"
								strokeWidth="4"
								fill="transparent"
								className="text-gray-700"
							/>
							<circle
								cx="32"
								cy="32"
								r="28"
								stroke="currentColor"
								strokeWidth="4"
								fill="transparent"
								className="text-purple-500 transition-all duration-1000 ease-linear"
								strokeDasharray={175}
								strokeDashoffset={
									175 - (175 * timeLeft) / (timeLimit / 1000)
								}
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* QUESTION TEXT */}
			<div className="bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-700 text-center flex-1 flex items-center justify-center">
				<h1 className="text-4xl font-bold text-white leading-tight">
					{question.text}
				</h1>
			</div>

			{/* IMAGE (Optional placeholder) */}
			{question.imageUrl && (
				<div className="h-64 w-full relative rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
					{/* <Image src={question.imageUrl} alt="Question" fill className="object-contain" /> */}
				</div>
			)}

			{/* OPTIONS GRID */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[300px]">
				{question.options.map((option, index) => (
					<OptionButton
						key={option.id}
						index={index}
						option={option}
						className="h-full text-3xl"
					/>
				))}
			</div>
		</div>
	);
}
