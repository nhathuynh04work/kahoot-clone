"use client";

import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";

interface SettingsModalProps {
	focusOn: "title" | null;
	onClose: () => void;
}

type SettingsFormValues = Pick<
	QuizFullDetails,
	"title" | "description" | "coverUrl"
>;

export default function SettingsModal({
	focusOn,
	onClose,
}: SettingsModalProps) {
	const { getValues, setValue } = useFormContext<QuizFullDetails>();

	const { register, handleSubmit, setFocus } = useForm<SettingsFormValues>({
		defaultValues: {
			title: getValues("title"),
			description: getValues("description"),
			coverUrl: getValues("coverUrl"),
		},
	});

	useEffect(() => {
		if (focusOn === "title") {
			setFocus("title");
		}
	}, [focusOn, setFocus]);

	const onSave = (data: SettingsFormValues) => {
		setValue("title", data.title, { shouldDirty: true });
		setValue("description", data.description, { shouldDirty: true });
		setValue("coverUrl", data.coverUrl, { shouldDirty: true });
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}>
			<form
				onSubmit={handleSubmit(onSave)}
				className="relative w-full max-w-lg rounded-lg bg-gray-800 border border-gray-700 shadow-2xl"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h3 className="text-xl font-semibold text-white">
						Quiz Settings
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Title
						</label>
						<input
							{...register("title", { required: true })}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white text-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
							placeholder="Enter quiz title..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Description
						</label>
						<textarea
							{...register("description")}
							rows={3}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
							placeholder="Enter a description..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Cover Image URL
						</label>
						<input
							{...register("coverUrl")}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
							placeholder="https://..."
						/>
					</div>
				</div>

				<div className="flex justify-end items-center gap-3 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
					<button
						type="button"
						onClick={onClose}
						className="font-semibold text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors">
						Cancel
					</button>
					<button
						type="submit"
						className="font-semibold text-white bg-indigo-800 hover:bg-indigo-900 rounded-md px-6 py-2 transition-colors">
						Done
					</button>
				</div>
			</form>
		</div>
	);
}
