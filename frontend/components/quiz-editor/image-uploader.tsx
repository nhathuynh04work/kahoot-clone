"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import { Image as LucideImage } from "lucide-react";
import Image from "next/image";

export default function ImageUploader({
	question,
}: {
	question: QuestionWithOptions;
}) {
	return (
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
					<p className="text-sm">Drag & drop or click to upload</p>
				</>
			)}
		</div>
	);
}
