"use client";

import { CheckCircle2, Image as LucideImage } from "lucide-react";
import Image from "next/image";
import { QuestionType, QuestionWithOptions } from "@/features/quizzes/types";

interface QuestionNavItemProps {
	question: QuestionWithOptions;
	index: number;
	isActive: boolean;
}

function getQuestionTypeLabel(type: QuestionType) {
	switch (type) {
		case "MULTIPLE_CHOICE":
			return "Multiple choice";
		case "TRUE_FALSE":
			return "True / false";
		case "SHORT_ANSWER":
			return "Short answer";
		case "NUMBER_INPUT":
			return "Number input";
		default:
			return "Question";
	}
}

export function QuestionNavItem({
	question,
	index,
	isActive,
}: QuestionNavItemProps) {
	const type = (question.type ?? "MULTIPLE_CHOICE") as QuestionType;
	const typeLabel = getQuestionTypeLabel(type);

	return (
		<div
			className={`group flex flex-col items-start gap-2 p-3 transition-colors duration-150 cursor-pointer rounded-lg ${
				isActive ? "bg-(--app-surface)" : ""
			}`}>
			<div className="w-full flex items-center justify-between">
				<div className="flex items-center gap-1 text-xs font-semibold text-(--app-fg-muted)">
					<span className="tabular-nums">{index + 1}</span>
					<span>{typeLabel}</span>
				</div>
			</div>

			<div
				className={`w-full flex flex-col items-center gap-3 p-2 rounded-sm 
                           transition-all
                           ${
								isActive
									? "bg-(--app-surface) ring-2 ring-indigo-400"
									: "bg-(--app-surface-muted) ring-1 ring-(--app-border) group-hover:ring-2 group-hover:ring-indigo-500/30"
							}`}>
				<p
					className="w-full max-w-xs font-medium truncate text-center text-(--app-fg-muted) text-xs"
					title={question.text || "Question"}>
					{question.text || "..."}
				</p>

				<div className="w-12 h-8 rounded border border-dashed border-(--app-border) flex items-center justify-center">
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
							className="w-5 h-5 text-(--app-fg-muted)/70"
							strokeWidth={1}
						/>
					)}
				</div>

				{type === "SHORT_ANSWER" ? (
					<div className="w-full max-w-xs mt-1 flex flex-col gap-1">
						<div className="h-6 rounded-xs border border-(--app-border) bg-(--app-bg) flex items-center px-2 text-[10px] text-(--app-fg-muted)">
							<span className="truncate">Answer</span>
						</div>
						<div className="w-full flex items-center justify-between text-[10px] text-(--app-fg-muted)/70">
							<span>
								{question.caseSensitive
									? "Case sensitive"
									: "Case insensitive"}
							</span>
						</div>
					</div>
				) : type === "NUMBER_INPUT" ? (
					<div className="w-full max-w-xs mt-1 flex items-center gap-2">
						<div className="flex-1 h-6 rounded-xs border border-(--app-border) bg-(--app-bg) flex items-center justify-between px-2 text-[10px]">
							<span className="text-(--app-fg-muted)">Number</span>
							<span className="text-(--app-fg-muted)/70 font-medium tabular-nums truncate pl-2">
								—
							</span>
						</div>
						{question.allowRange ? (
							<div className="shrink-0 w-10 h-6 rounded-xs border border-(--app-border) bg-(--app-surface-muted)" />
						) : null}
					</div>
				) : (
					<div className={`w-full max-w-xs grid grid-cols-2 gap-1 mt-1 h-5`}>
						{(question.options || [])
							.slice()
							.sort((a, b) => a.sortOrder - b.sortOrder)
							.map((option) => (
								<div
									key={option.id}
									className={`h-${
										(question.options?.length ?? 0) > 2 ? "2" : "5"
									} rounded-xs border border-(--app-border) flex items-center justify-end pr-2`}>
									{option.isCorrect && (
										<CheckCircle2 className="w-2 h-2 text-green-400" />
									)}
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
