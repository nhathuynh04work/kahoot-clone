"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import { Image as LucideImage } from "lucide-react";
import Image from "next/image";

interface QuestionNavItemProps {
	question: QuestionWithOptions;
}

export default function QuestionNavItem({ question }: QuestionNavItemProps) {
	return (
		<div className="group flex flex-col items-start gap-2 p-4 border-b border-gray-700 transition-colors duration-150 cursor-pointer">
			<div
				className="w-full flex flex-col items-center gap-3 bg-gray-800 p-2 rounded-sm 
                           border border-transparent group-hover:border-gray-500 transition-colors">
				<p
					className="w-full max-w-xs font-medium truncate text-center text-gray-200 text-xs"
					title={question.text || "Question"}>
					{question.sortOrder + 1}. {question.text || "Question"}
				</p>

				<div className="w-20 h-12 rounded bg-gray-700 flex items-center justify-center">
					{question.imageUrl ? (
						<Image
							src={question.imageUrl}
							alt="Question visual"
							className="w-full h-full object-cover rounded"
						/>
					) : (
						<LucideImage
							className="w-8 h-8 text-gray-500"
							strokeWidth={1}
						/>
					)}
				</div>

				<div className="w-full max-w-xs grid grid-cols-2 gap-1 mt-1">
					<div className="h-2 rounded-xs bg-gray-700 border border-gray-600"></div>
					<div className="h-2 rounded-xs bg-gray-700 border border-gray-600"></div>
					<div className="h-2 rounded-xs bg-gray-700 border border-gray-600"></div>
					<div className="h-2 rounded-xs bg-gray-700 border border-gray-600"></div>
				</div>
			</div>
		</div>
	);
}
