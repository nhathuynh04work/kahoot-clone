import { QuestionWithOptions } from "@/features/quizzes/types";

export const getStatsOfCurrentQuestion = (
	question: QuestionWithOptions,
	answerStats: Record<number, number>
) => {
	const questionOptionIds = question.options.map((o) => o.id);
	const result: Record<number, number> = {};

	for (const id of questionOptionIds) {
		result[id] = answerStats[id] ? answerStats[id] : 0;
	}

	return result;
};

export const getTotalAnswerCountForCurrentQuestion = (
	question: QuestionWithOptions,
	answerStats: Record<number, number>
) => {
	const answerStatsOfCurrentQuestion = getStatsOfCurrentQuestion(
		question,
		answerStats
	);

	const totalAnswerCount = Object.values(answerStatsOfCurrentQuestion).reduce(
		(sum, current) => sum + current,
		0
	);

	return totalAnswerCount;
};
