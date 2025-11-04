export interface UpdateQuizDto {
	title?: string;
	description?: string;
	coverUrl?: string;
}

export interface UpdateQuestionDto {
	text?: string;
	imageUrl?: string;
	timeLimit?: number;
	sortOrder?: number;
	points?: number;
}

export interface CreateOptionDto {
	text: string;
}

export interface UpdateOptionDto {
	text?: string;
	isCorrect?: boolean;
}
