"use client";

import { CheckCircle2, Image as LucideImage } from "lucide-react";
import Image from "next/image";
import { QuestionWithOptions } from "../../types";

interface QuestionNavItemProps {
	question: QuestionWithOptions;
	index: number;
	isActive: boolean;
}

export default function QuestionNavItem({
	question,
	index,
	isActive,
}: QuestionNavItemProps) {
	return (
		<div
			className={`group flex flex-col items-start gap-2 p-4 transition-colors duration-150 cursor-pointer ${
				isActive ? "bg-gray-700" : ""
			}`}>
			<div
				className={`w-full flex flex-col items-center gap-3 p-2 rounded-sm 
                           transition-all
                           ${
								isActive
									? "bg-gray-700 ring-2 ring-indigo-400"
									: "bg-gray-800 ring-1 ring-gray-600 group-hover:ring-2 group-hover:ring-gray-500"
							}`}>
				<p
					className="w-full max-w-xs font-medium truncate text-center text-gray-200 text-xs"
					title={question.text || "Question"}>
					{index + 1}. {question.text || "Question"}
				</p>

				<div className="w-12 h-8 rounded border border-dashed border-gray-500 flex items-center justify-center">
					{question.imageUrl ? (
						<Image
							src={question.imageUrl}
							alt="Question visual"
							className="w-full h-full object-contain rounded"
							width={48}
							height={32}
						/>
					) : (
						<LucideImage
							className="w-5 h-5 text-gray-500"
							strokeWidth={1}
						/>
					)}
				</div>

				<div
					className={`w-full max-w-xs grid grid-cols-2 gap-1 mt-1 h-5`}>
					{question.options
						.sort((a, b) => a.sortOrder - b.sortOrder)
						.map((option) => (
							<div
								key={option.id}
								className={`h-${
									question.options.length > 2 ? "2" : "5"
								} rounded-xs border border-gray-600 flex items-center justify-end pr-2`}>
								{option.isCorrect && (
									<CheckCircle2 className="w-2 h-2 text-green-400" />
								)}
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
