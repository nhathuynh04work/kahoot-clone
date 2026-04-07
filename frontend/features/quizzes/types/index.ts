export type QuestionType =
	| "MULTIPLE_CHOICE"
	| "TRUE_FALSE"
	| "SHORT_ANSWER"
	| "NUMBER_INPUT";

export type Quiz = {
	id: number;
	userId: number;
	title: string;
	description?: string;
	coverUrl?: string;
	authorName?: string | null;
	visibility?: "PUBLIC" | "PRIVATE";
	playCount?: number;
	saveCount?: number;
	createdAt: Date;
};

/** Server stores type-specific fields in `data`; API also flattens SA/NR (and some MC flags) for forms. */
export type Question = {
	id: number;
	quizId: number;
	text?: string;
	timeLimit: number;
	points: number;
	imageUrl?: string;
	sortOrder: number;
	type?: QuestionType;
	data?: Record<string, unknown>;
	correctText?: string | null;
	/** Multiple choice: when false, more than one option may be correct. */
	onlyOneCorrect?: boolean;
	/** Short answer: when true, grading is case-sensitive. */
	caseSensitive?: boolean;
	/** Number input: when true, accept within correctNumber ± rangeProximity (inclusive). */
	allowRange?: boolean;
	/** Number input: exact expected number when allowRange is false. */
	correctNumber?: number | string | null;
	/** Number input: when allowRange is true, accept within ± proximity of correctNumber. */
	rangeProximity?: number | string | null;
};

/** Synthetic MC/TF options: `id` is the 0-based play index. */
export type Option = {
	id: number;
	questionId: number;
	text?: string;
	isCorrect: boolean;
	sortOrder: number;
};

export type QuizWithQuestions = Quiz & { questions: Question[] };

export type QuestionWithOptions = Question & { options: Option[] };

export type QuizFullDetails = Quiz & { questions: QuestionWithOptions[] };
