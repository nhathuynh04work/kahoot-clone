"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateQuiz } from "@/app/hooks/quiz-mutation";
import { X } from "lucide-react";
import { QuizFullDetails } from "@/lib/types/quiz";
import { UpdateQuizDto } from "@/lib/dtos/quiz.dto";

interface SettingsModalProps {
	quiz: QuizFullDetails;
	focusOn: "title" | null;
	onClose: () => void;
}

type FormValues = {
	title: string;
	description: string;
	coverUrl: string;
};

export default function SettingsModal({
	quiz,
	focusOn,
	onClose,
}: SettingsModalProps) {
	const { register, handleSubmit, setFocus } = useForm<FormValues>({
		defaultValues: {
			title: quiz.title || "",
			description: quiz.description || "",
			coverUrl: quiz.coverUrl || "",
		},
	});

	const { mutate: updateQuiz, isPending } = useUpdateQuiz(quiz.id, {
		onSuccess: () => {
			onClose();
		},
	});

	useEffect(() => {
		if (focusOn === "title") {
			setFocus("title");
		}
	}, [focusOn, setFocus]);

	function onSave(data: FormValues) {
		const payload: UpdateQuizDto = {};

		const formKeys = Object.keys(data) as (keyof FormValues)[];

		for (const key of formKeys) {
			const originalValue = quiz[key] || "";
			const newValue = data[key];

			if (newValue !== originalValue) {
				payload[key] = newValue;
			}
		}

		if (Object.keys(payload).length > 0) {
			updateQuiz(payload);
		} else {
			onClose();
		}
	}

	return (
		<div
			className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
			onClick={onClose}>
			<form
				onSubmit={handleSubmit(onSave)}
				className="relative z-50 w-full max-w-lg rounded-lg bg-gray-800 border border-gray-700 shadow-lg"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h3 className="text-xl font-semibold text-white">
						Quiz Settings
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Form Body */}
				<div className="p-6 space-y-4">
					{/* Title */}
					<div>
						<label
							htmlFor="quizTitle"
							className="block text-sm font-medium text-gray-300 mb-2">
							Title
						</label>
						<input
							id="quizTitle"
							type="text"
							{...register("title")}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white text-lg font-semibold"
							placeholder="Enter quiz title..."
						/>
					</div>

					{/* Description */}
					<div>
						<label
							htmlFor="quizDescription"
							className="block text-sm font-medium text-gray-300 mb-2">
							Description
						</label>
						<textarea
							id="quizDescription"
							{...register("description")}
							rows={3}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white resize-none"
							placeholder="Enter a description..."
						/>
					</div>

					{/* Cover Image URL */}
					<div>
						<label
							htmlFor="quizCoverUrl"
							className="block text-sm font-medium text-gray-300 mb-2">
							Cover Image URL
						</label>
						<input
							id="quizCoverUrl"
							type="url"
							{...register("coverUrl")}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white"
							placeholder="https://..."
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end items-center gap-3 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
					<button
						type="button"
						onClick={onClose}
						disabled={isPending}
						className="font-semibold text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50">
						Cancel
					</button>

					<button
						type="submit"
						disabled={isPending}
						className="font-semibold text-white bg-indigo-800 rounded-md px-6 py-2 hover:bg-indigo-900 transition-colors disabled:opacity-50">
						{isPending ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</div>
	);
}
