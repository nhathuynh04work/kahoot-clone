"use client";

import { QuestionWithOptions } from "@/features/quizzes/types";
import { useEffect, useState } from "react";
import { Clock, Users } from "lucide-react";
import Image from "next/image";

interface HostQuestionScreenProps {
	currentQuestion: QuestionWithOptions;
	currentQuestionIndex: number;
	totalQuestions: number;
	totalAnswerCount: number;
	onTimeUp: () => void;
}

const getOptionColor = (index: number) => {
	const colors = [
		"bg-red-500 border-red-600",
		"bg-blue-500 border-blue-600",
		"bg-yellow-500 border-yellow-600",
		"bg-green-500 border-green-600",
	];
	return colors[index % colors.length];
};

export const HostQuestionScreen = ({
	currentQuestion,
	currentQuestionIndex,
	totalQuestions,
	totalAnswerCount,
	onTimeUp,
}: HostQuestionScreenProps) => {
	const [time, setTime] = useState(currentQuestion.timeLimit);

	useEffect(() => {
		if (time <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			setTime((prev) => Math.max(0, prev - 100));
		}, 100);

		return () => clearInterval(timer);
	}, [onTimeUp, time]);

	const percentage = (time / currentQuestion.timeLimit) * 100;
	const secondsLeft = Math.ceil(time / 1000);

	const qType = currentQuestion.type ?? "MULTIPLE_CHOICE";
	const imageUrl = currentQuestion.imageUrl?.trim() || "";

	return (
		<div className="h-dvh bg-transparent p-4 sm:p-6 overflow-hidden">
			<div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-hidden">
			<div className="flex items-center justify-between gap-3 text-(--app-fg-muted) text-sm font-medium shrink-0">
				<span className="bg-(--app-surface-muted) px-3 py-1 rounded-md border border-(--app-border)">
					Question {currentQuestionIndex + 1} / {totalQuestions}
				</span>
				<div className="flex items-center gap-2 shrink-0">
					<Users size={16} />
					<span>{totalAnswerCount} Answers</span>
				</div>
			</div>

			<div className="flex flex-col items-center gap-3 shrink-0">
				<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-(--app-fg) max-w-5xl leading-tight line-clamp-3">
					{currentQuestion.text}
				</h2>

				<div className="flex flex-col items-center gap-2 w-full max-w-xl">
					<div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-(--app-fg)">
						<Clock className="text-indigo-400" size={28} />
						<span className="tabular-nums">{secondsLeft}</span>
					</div>
					<div className="w-full h-2.5 bg-(--app-surface-muted) rounded-full overflow-hidden border border-(--app-border)">
						<div
							className="h-full bg-indigo-500 transition-all ease-linear duration-100"
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</div>
			</div>

			{imageUrl ? (
				<div className="shrink-0 flex justify-center">
					<div className="relative w-full max-w-4xl h-[min(32vh,280px)] rounded-2xl overflow-hidden border border-(--app-border) bg-(--app-surface-muted) shadow-sm">
						<Image
							src={imageUrl}
							alt={
								(currentQuestion.text ?? "Question image").trim() ||
								"Question image"
							}
							fill
							className="object-contain"
							sizes="(max-width: 768px) 100vw, 900px"
						/>
					</div>
				</div>
			) : null}

			{qType === "MULTIPLE_CHOICE" || qType === "TRUE_FALSE" ? (
				<div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 gap-3 sm:gap-4 overflow-hidden">
					{[...currentQuestion.options]
						.sort((a, b) => a.sortOrder - b.sortOrder)
						.map((o, i) => (
							<div
								key={o.id}
								className={`${getOptionColor(
									i
								)} border-b-4 rounded-lg p-3 sm:p-4 flex items-center shadow-sm min-h-0 h-full overflow-hidden`}>
								<div className="bg-black/20 w-8 h-8 flex items-center justify-center rounded text-white font-bold mr-4 text-sm shrink-0">
									{String.fromCharCode(65 + i)}
								</div>
								<span className="text-white text-base sm:text-lg md:text-xl font-semibold drop-shadow-sm line-clamp-2">
									{o.text}
								</span>
							</div>
						))}
				</div>
			) : (
				<div className="flex-1 min-h-0 rounded-2xl border border-(--app-border) bg-(--app-surface-muted)/60 flex items-center justify-center">
					<p className="text-(--app-fg-muted) font-medium">
						Players are answering on their devices.
					</p>
				</div>
			)}
			</div>
		</div>
	);
};
