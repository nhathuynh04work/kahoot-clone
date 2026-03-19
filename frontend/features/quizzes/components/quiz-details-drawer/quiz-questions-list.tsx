"use client";

import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Option, Question } from "@/features/quizzes/types";
import { QuestionPreview } from "@/features/quizzes/components/question-preview";

export function QuizQuestionItem({
	question,
	index,
	isExpanded,
	onToggle,
	options,
	showAnswers,
}: {
	question: Question;
	index: number;
	isExpanded: boolean;
	onToggle: () => void;
	options: Option[] | null;
	showAnswers: boolean;
}) {
	return (
		<li className="group rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden transition-colors hover:bg-gray-800 hover:border-indigo-500/40 focus-within:border-indigo-500/60">
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-start gap-4 p-4 text-left"
			>
				<div className="shrink-0">
					<div className="w-12 h-12 rounded-lg bg-gray-700/60 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors overflow-hidden">
						{question.imageUrl ? (
							<Image
								src={question.imageUrl}
								alt=""
								width={48}
								height={48}
								className="object-cover w-full h-full"
							/>
						) : (
							<span className="text-xs font-semibold text-gray-400 tabular-nums">
								Q{index + 1}
							</span>
						)}
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs text-gray-400 tabular-nums">
						Question {index + 1}
					</p>
					<p className="mt-0.5 text-sm font-semibold text-white truncate">
						{question.text?.trim() || "-"}
					</p>
				</div>
				{isExpanded ? (
					<ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
				) : (
					<ChevronRight className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
				)}
			</button>

			{isExpanded && (
				<div className="border-t border-gray-700 bg-gray-950/30">
					<QuestionPreview
						question={question}
						options={options}
						revealCorrect={showAnswers}
						showQuestionText={false}
						variant="compact"
					/>
				</div>
			)}
		</li>
	);
}

export function QuizQuestionList({
	questions,
	questionsLoading,
	expandedIds,
	onToggleExpanded,
	getOptions,
	showAnswers,
}: {
	questions: Question[];
	questionsLoading: boolean;
	expandedIds: Set<number>;
	onToggleExpanded: (id: number) => void;
	getOptions: (q: Question) => Option[] | null;
	showAnswers: boolean;
}) {
	if (questionsLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	if (questions.length === 0) {
		return (
			<p className="text-gray-400 text-center py-8">No questions yet.</p>
		);
	}

	return (
		<ul className="space-y-3">
			{questions.map((q, index) => (
				<QuizQuestionItem
					key={q.id}
					question={q}
					index={index}
					isExpanded={expandedIds.has(q.id)}
					onToggle={() => onToggleExpanded(q.id)}
					options={getOptions(q)}
					showAnswers={showAnswers}
				/>
			))}
		</ul>
	);
}

