"use client";

import { useMemo, useState } from "react";
import { QuizCard } from "@/features/quizzes/components/quiz-card";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsDrawer } from "@/features/quizzes/components/quiz-details-drawer";

type PublicQuiz = QuizWithQuestions & { saveCount?: number; playCount?: number };

type PublicQuizPage = {
	items: PublicQuiz[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export function PublicQuizFeed({
	initial,
	viewerId,
}: {
	initial: PublicQuizPage;
	viewerId?: number;
}) {
	const apiBase = useMemo(
		() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
		[],
	);
	const [items, setItems] = useState<PublicQuiz[]>(initial.items ?? []);
	const [page, setPage] = useState(initial.page ?? 1);
	const [totalPages, setTotalPages] = useState(initial.totalPages ?? 1);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

	const canLoadMore = page < totalPages;

	const selectedQuiz = useMemo(() => {
		if (selectedQuizId === null) return null;
		return items.find((q) => q.id === selectedQuizId) ?? null;
	}, [items, selectedQuizId]);

	const loadMore = async () => {
		if (isLoading || !canLoadMore) return;
		try {
			setIsLoading(true);
			const nextPage = page + 1;
			const res = await fetch(
				`${apiBase}/public/quizzes?mode=recent&page=${nextPage}&pageSize=${initial.pageSize ?? 12}`,
				{ cache: "no-store" },
			);
			if (!res.ok) return;
			const data = (await res.json()) as PublicQuizPage;
			setItems((prev) => [...prev, ...(data.items ?? [])]);
			setPage(data.page ?? nextPage);
			setTotalPages(data.totalPages ?? totalPages);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{items.length === 0 ? (
				<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center text-gray-400">
					No public quizzes yet.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((quiz) => (
						<QuizCard
							key={quiz.id}
							quiz={quiz}
							canEdit={false}
							viewerId={viewerId}
							onCardClick={() => setSelectedQuizId(quiz.id)}
						/>
					))}
				</div>
			)}

			<div className="flex justify-center">
				<button
					type="button"
					onClick={loadMore}
					disabled={!canLoadMore || isLoading}
					className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? "Loading…" : canLoadMore ? "Show more" : "No more"}
				</button>
			</div>

			{selectedQuiz && (
				<QuizDetailsDrawer
					quiz={selectedQuiz}
					variant="public"
					onClose={() => setSelectedQuizId(null)}
				/>
			)}
		</div>
	);
}

