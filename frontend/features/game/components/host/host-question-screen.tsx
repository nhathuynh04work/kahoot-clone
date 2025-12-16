"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";

interface HostQuestionScreenProps {
	currentQuestion: QuestionWithOptions;
	currentQuestionIndex: number;
	totalQuestions: number;
	onNext: () => void;
}

export const HostQuestionScreen = ({
	currentQuestion,
	currentQuestionIndex,
	totalQuestions,
	onNext,
}: HostQuestionScreenProps) => {
	return (
		<div className="flex flex-col gap-10">
			<p>
				{currentQuestionIndex + 1}/{totalQuestions}
			</p>
			<p>{currentQuestion.text}</p>

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
