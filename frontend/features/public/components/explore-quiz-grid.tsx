"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizCard } from "@/features/quizzes/components/quiz-card";

export function ExploreQuizGrid({
	quizzes,
	viewerId,
}: {
	quizzes: Array<QuizWithQuestions & { saveCount?: number; playCount?: number }>;
	viewerId?: number;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const qs = searchParams.toString();
	const from = `${pathname}${qs ? `?${qs}` : ""}`;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{quizzes.map((quiz) => (
				<QuizCard
					key={quiz.id}
					quiz={quiz}
					canEdit={false}
					viewerId={viewerId}
					onCardClick={() => {
						router.push(`/quiz/${quiz.id}?from=${encodeURIComponent(from)}`);
					}}
				/>
			))}
		</div>
	);
}

