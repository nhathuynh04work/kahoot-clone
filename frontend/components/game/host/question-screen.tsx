"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import { useState, useEffect } from "react";
import { Clock, Users, Infinity } from "lucide-react";
import OptionButton from "../common/option-button";

interface QuestionScreenProps {
	question: QuestionWithOptions;
	onNext: () => void;
	totalPlayers: number;
	answerCount: number;
}

export default function QuestionScreen({
	question,
	onNext,
	totalPlayers,
	answerCount,
}: QuestionScreenProps) {
	const [timeLeft, setTimeLeft] = useState<number | null>(() =>
		question.timeLimit ? question.timeLimit / 100 : null
	);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev === null || prev <= 1) {
					clearInterval(timer);
					onNext();
					return 0;
				}

				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [onNext]);

	return (
		<div className="flex flex-col h-screen p-8 bg-gray-900 text-white">
			{/* Top Bar: Timer and Answer Count */}
			<div className="flex justify-between items-center text-2xl font-bold">
				{timeLeft !== null ? (
					<div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
						<Clock className="w-8 h-8 text-yellow-400" />
						<span>{timeLeft}</span>
					</div>
				) : (
					<div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
						<Infinity className="w-8 h-8 text-gray-400" />
					</div>
				)}

				<div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
					<span>
						{answerCount} / {totalPlayers}
					</span>
					<Users className="w-8 h-8 text-blue-400" />
				</div>
			</div>

			{/* Question Text */}
			<div className="grow flex items-center justify-center">
				<h1 className="text-4xl md:text-6xl font-extrabold text-center max-w-4xl">
					{question.text}
				</h1>
			</div>

			{/* Answer Options */}
			<div className="grid grid-cols-2 gap-4 mb-8">
				{question.options.map((option) => (
					<OptionButton
						key={option.id}
						option={option}
						isHostView={true}
					/>
				))}
			</div>

			{/* Control Button */}
			<div className="text-right">
				<button
					onClick={onNext}
					className="px-8 py-3 bg-indigo-600 rounded-lg text-xl font-bold hover:bg-indigo-700 transition">
					Show Results &rarr;
				</button>
			</div>
		</div>
	);
}
