import { useEffect, useState } from "react";
import type { QuizFullDetails } from "../types";
import { getQuiz } from "../api/server-actions";

export function useFullQuiz(quizId: number) {
	const [fullQuiz, setFullQuiz] = useState<QuizFullDetails | null>(null);
	const [questionsLoading, setQuestionsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		setQuestionsLoading(true);
		setFullQuiz(null);

		(async () => {
			try {
				const data = await getQuiz(String(quizId));
				if (!cancelled) setFullQuiz(data);
			} catch {
				if (!cancelled) setFullQuiz(null);
			} finally {
				if (!cancelled) setQuestionsLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [quizId]);

	return { fullQuiz, questionsLoading };
}

