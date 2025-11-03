"use client";

import { updateQuestion } from "@/app/actions/quiz";
import { UpdateQuestionDto } from "@/lib/dtos/quiz.dto";
import { QuestionWithOptions } from "@/lib/types/quiz";
import { useMutation } from "@tanstack/react-query";
import { Image as LucideImage, CheckCircle, Circle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FocusEvent } from "react";

interface QuestionEditorProps {
	question: QuestionWithOptions | undefined;
}

const optionColors = [
	"bg-red-800",
	"bg-blue-800",
	"bg-yellow-800",
	"bg-green-800",
];

export default function QuestionEditor({ question }: QuestionEditorProps) {
	const router = useRouter();

	const { mutate: mutateQuestion } = useMutation({
		mutationFn: (payload: UpdateQuestionDto) => {
			if (!question) throw new Error("No question selected");
			return updateQuestion({
				questionId: question.id,
				quizId: question.quizId,
				payload,
			});
		},
		onSuccess: () => {
			router.refresh();
		},
		onError: (err) => console.error("Failed to update question", err),
	});

	function handleQuestionTextBlur(e: FocusEvent<HTMLInputElement>) {
		const newText = e.target.value;
		if (newText !== question?.text) {
			mutateQuestion({ text: newText });
		}
	}

	if (!question) {
		return (
			<div className="col-span-7 col-start-3 h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400">
				<p className="text-xl font-semibold">No Question Selected</p>
				<p>Select a question from the list to start editing.</p>
			</div>
		);
	}

	return (
		<div className="col-span-7 col-start-3 h-full flex flex-col items-center p-8 overflow-y-auto bg-gray-800">
			{/* Question Text Input */}
			<div className="w-full mb-6">
				<label htmlFor="questionText" className="sr-only">
					Question Text
				</label>
				<input
					id="questionText"
					type="text"
					className="w-full p-4 bg-gray-900 border border-gray-700 rounded-md text-white text-xl text-center font-semibold"
					placeholder="Start typing your question..."
					defaultValue={question.text || ""}
					onBlur={handleQuestionTextBlur}
					key={question.id}
				/>
			</div>

			{/* Image Uploader Placeholder */}
			<div className="w-full max-w-md h-64 rounded-md bg-gray-900 border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 mb-6">
				{question.imageUrl ? (
					<Image
						src={question.imageUrl}
						alt="Question visual"
						width={448}
						height={256}
						className="w-full h-full object-cover rounded"
					/>
				) : (
					<>
						<LucideImage className="w-16 h-16" strokeWidth={1} />
						<p className="mt-2 font-semibold">Add Image</p>
						<p className="text-sm">
							Drag & drop or click to upload
						</p>
					</>
				)}
			</div>

			<div className="w-full grid grid-cols-2 gap-4">
				{question.options.map((option, index) => (
					<div
						key={option.id}
						className={`p-4 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-3`}>
						<div
							className={`w-10 h-10 rounded-md ${
								optionColors[index % 4]
							}`}></div>

						<input
							type="text"
							className="grow bg-transparent text-white text-lg font-medium placeholder:text-gray-500 focus:outline-none"
							placeholder={`Option ${index + 1}`}
							defaultValue={option.text || ""}
						/>

						{/* Correct Answer Toggle */}
						<button
							className="shrink-0"
							title={
								option.isCorrect
									? "Mark as incorrect"
									: "Mark as correct"
							}>
							{option.isCorrect ? (
								<CheckCircle className="w-6 h-6 text-green-500" />
							) : (
								<Circle className="w-6 h-6 text-gray-600 hover:text-gray-400" />
							)}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
