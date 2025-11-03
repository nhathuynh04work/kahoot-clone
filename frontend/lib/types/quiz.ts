export type Quiz = {
	id: number;
	userId: number;
	title: string;
	description?: string;
	coverUrl?: string;
	createdAt: Date;
};

export type Question = {
	id: number;
	quizId: number;
	text?: string;
	timeLimit?: number;
	points: number;
	imageUrl?: string;
	sortOrder: number;
};

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
