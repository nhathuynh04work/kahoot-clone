"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { QuizCard } from "./quiz-card";
import { QuizWithQuestions } from "@/features/quizzes/types";
import { getMySavedQuizIds } from "@/features/quizzes/api/client-actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface QuizGridProps {
	quizzes: QuizWithQuestions[];
	viewerId?: number;
	selectedQuizId?: number;
	basePath?: string;
	closeHref?: string;
}

export function QuizGrid({
	quizzes,
	viewerId,
	selectedQuizId,
	basePath,
	closeHref,
}: QuizGridProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useQuery({
		queryKey: ["mySavedQuizzes"],
		queryFn: getMySavedQuizIds,
	});

	const derivedSelectedQuiz = useMemo(() => {
		if (typeof selectedQuizId !== "number") return null;
		return quizzes.find((q) => q.id === selectedQuizId) ?? null;
	}, [quizzes, selectedQuizId]);

	const _legacyEffectiveSelected = derivedSelectedQuiz;
	const _legacyIsUrlControlled = !!basePath;
	const _legacyCloseHref = closeHref;

	const from = useMemo(() => {
		const qs = searchParams.toString();
		return `${pathname}${qs ? `?${qs}` : ""}`;
	}, [pathname, searchParams]);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{quizzes.map((quiz) => (
					<QuizCard
						key={quiz.id}
						quiz={quiz}
						viewerId={viewerId}
						onCardClick={() => {
							router.push(`/quiz/${quiz.id}?from=${encodeURIComponent(from)}`);
						}}
					/>
				))}
			</div>
		</>
	);
}
