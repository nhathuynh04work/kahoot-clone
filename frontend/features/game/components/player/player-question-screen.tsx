"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";

interface PlayerQuestionScreenProps {
	question: QuestionWithOptions;
	onSubmit: (optionId: number) => void;
}

export const PlayerQuestionScreen = ({
	question,
	onSubmit,
}: PlayerQuestionScreenProps) => {
	return (
		<div className="flex flex-col gap-10">
			<p>{question.text}</p>

			<div className="flex flex-col gap-4">
				{question.options.map((o) => (
					<div
						key={o.id}
						className="border cursor-pointer"
						onClick={() => onSubmit(o.id)}>
						{o.text}
					</div>
				))}
			</div>
		</div>
	);
};
