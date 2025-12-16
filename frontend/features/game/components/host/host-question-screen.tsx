"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";
import { useEffect, useState } from "react";

interface HostQuestionScreenProps {
	currentQuestion: QuestionWithOptions;
	currentQuestionIndex: number;
	totalQuestions: number;
	totalAnswerCount: number;
	onTimeUp: () => void;
}

export const HostQuestionScreen = ({
	currentQuestion,
	currentQuestionIndex,
	totalQuestions,
	totalAnswerCount,
	onTimeUp: onTimeUp,
}: HostQuestionScreenProps) => {
	const [time, setTime] = useState(currentQuestion.timeLimit);

	useEffect(() => {
		if (time <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			setTime((time) => Math.max(0, time - 100));
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, [onTimeUp, time]);

	const percentage = (time / currentQuestion.timeLimit) * 100;

	return (
		<div className="flex flex-col gap-10">
			<p>
				{currentQuestionIndex + 1}/{totalQuestions}
			</p>
			<p>{currentQuestion.text}</p>
			<p>{totalAnswerCount}</p>

			<div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-700">
				<div
					className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all ease-linear duration-100"
					style={{ width: `${percentage}%` }}
				/>
			</div>

			<div className="flex flex-col gap-4">
				{currentQuestion.options.map((o) => (
					<div key={o.id} className="border">
						{o.text}
					</div>
				))}
			</div>
		</div>
	);
};
