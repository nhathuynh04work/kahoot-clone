import { apiClient as api } from "@/lib/apiClient";
import { Quiz, QuizFullDetails, QuestionWithOptions, QuestionType } from "../types";

export const createQuiz = async () => {
	const { data } = await api.post("/quiz");
	return data as Quiz;
};

const QUESTION_DATA_VERSION = 1;

function buildQuestionData(q: QuestionWithOptions): Record<string, unknown> {
	const type: QuestionType = q.type ?? "MULTIPLE_CHOICE";
	if (type === "MULTIPLE_CHOICE") {
		const sorted = [...(q.options || [])].sort(
			(a, b) => a.sortOrder - b.sortOrder,
		);
		const correctIndices = sorted
			.map((o, i) => (o.isCorrect ? i : -1))
			.filter((i) => i >= 0);
		const onlyOne = q.onlyOneCorrect !== false;
		return {
			v: QUESTION_DATA_VERSION,
			options: sorted.map((o, i) => ({
				text: o.text ?? "",
				sortOrder: o.sortOrder ?? i,
			})),
			onlyOneCorrect: onlyOne,
			correctIndices:
				correctIndices.length > 0 ? correctIndices : [0],
		};
	}
	if (type === "TRUE_FALSE") {
		const sorted = [...(q.options || [])].sort(
			(a, b) => a.sortOrder - b.sortOrder,
		);
		const correctIdx = sorted.findIndex((o) => o.isCorrect);
		return {
			v: QUESTION_DATA_VERSION,
			correctIsTrue: correctIdx !== 1,
		};
	}
	if (type === "SHORT_ANSWER") {
		return {
			v: QUESTION_DATA_VERSION,
			correctText: (q.correctText ?? "").trim(),
			caseSensitive: q.caseSensitive === true,
		};
	}
	const allowRange = q.allowRange === true;
	const correctNumber = Number(q.correctNumber ?? 0);
	const safeCorrectNumber = Number.isFinite(correctNumber) ? correctNumber : 0;
	if (allowRange) {
		const proximity = Number((q as any).rangeProximity ?? (q as any).proximity);
		const safeProximity =
			Number.isFinite(proximity) && proximity >= 0 ? proximity : undefined;

		if (safeProximity != null) {
			return {
				v: QUESTION_DATA_VERSION,
				allowRange: true,
				correctNumber: safeCorrectNumber,
				rangeProximity: safeProximity,
			};
		}
		return {
			v: QUESTION_DATA_VERSION,
			allowRange: true,
			correctNumber: safeCorrectNumber,
			rangeProximity: 0,
		};
	}
	return {
		v: QUESTION_DATA_VERSION,
		allowRange: false,
		correctNumber: safeCorrectNumber,
	};
}

/** Strip client-only fields; send Prisma-shaped questions with `data`. */
function serializeQuizForPatch(payload: QuizFullDetails) {
	const {
		authorName: _a,
		saveCount: _s,
		playCount: _p,
		questions,
		...quizRest
	} = payload;

	return {
		...quizRest,
		questions: questions.map((q) => ({
			id: q.id,
			text: q.text,
			timeLimit: q.timeLimit,
			points: q.points,
			imageUrl: q.imageUrl,
			sortOrder: q.sortOrder,
			type: q.type ?? "MULTIPLE_CHOICE",
			data: buildQuestionData(q),
		})),
	};
}

export const updateQuiz = async (payload: QuizFullDetails) => {
	const { data } = await api.patch(`/quiz/${payload.id}`, serializeQuizForPatch(payload));
	return data as QuizFullDetails;
};

export const toggleQuizSave = async (quizId: number) => {
	const { data } = await api.post(`/saves/QUIZ/${quizId}`);
	return data as { saved: boolean; targetType: "QUIZ"; targetId: number };
};

export const getMySavedQuizIds = async (): Promise<number[]> => {
	const { data } = await api.get<{ ids: number[] }>("/saves/QUIZ");
	return data.ids;
};
