"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";

export default function QuestionScreen({
	question,
}: {
	question: QuestionWithOptions;
}) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
			<h2 className="text-3xl font-bold mb-8 text-center">
				{question?.text}
			</h2>
			<div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
				{question?.options.map((option: any) => (
					<button
						key={option.id}
						// TODO: Add onClick handler to emit 'submitAnswer'
						className="p-8 bg-indigo-600 rounded-lg text-2xl font-semibold hover:bg-indigo-700 transition">
						{option.text}
					</button>
				))}
			</div>
		</div>
	);
}
