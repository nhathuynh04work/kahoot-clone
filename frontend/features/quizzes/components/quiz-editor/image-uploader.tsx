"use client";

import { useFormContext } from "react-hook-form";
import { Image as LucideImage, Trash2 } from "lucide-react";
import Image from "next/image";
import { QuizFullDetails } from "@/features/quizzes/types";

export default function ImageUploader({
	questionIndex,
}: {
	questionIndex: number;
}) {
	const { watch, setValue } = useFormContext<QuizFullDetails>();
	const imageUrl = watch(`questions.${questionIndex}.imageUrl`);

	return (
		<div className="w-full max-w-md h-64 rounded-md bg-gray-900 border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 mb-6 overflow-hidden relative group">
			{imageUrl ? (
				<>
					<Image
						src={imageUrl}
						alt="Question visual"
						fill
						className="object-cover"
					/>
					{/* Remove Image Overlay */}
					<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
						<button
							onClick={() =>
								setValue(
									`questions.${questionIndex}.imageUrl`,
									"",
									{ shouldDirty: true }
								)
							}
							className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-red-700">
							<Trash2 className="w-4 h-4" /> Remove
						</button>
					</div>
				</>
			) : (
				<div className="flex flex-col items-center p-6 text-center">
					<LucideImage
						className="w-16 h-16 mb-4 opacity-50"
						strokeWidth={1}
					/>
					<p className="font-semibold mb-1">Add Image</p>
					<p className="text-sm opacity-70 mb-4">
						Drag & drop or click to upload
					</p>
					{/* Placeholder for future implementation */}
					<button
						type="button"
						className="text-xs bg-gray-800 border border-gray-600 px-3 py-1 rounded hover:bg-gray-700"
						onClick={() => {
							const mockUrl =
								"https://images.unsplash.com/photo-1546776310-5112af4e6621?q=80&w=1000";
							setValue(
								`questions.${questionIndex}.imageUrl`,
								mockUrl,
								{ shouldDirty: true }
							);
						}}>
						(Mock Upload)
					</button>
				</div>
			)}
		</div>
	);
}
