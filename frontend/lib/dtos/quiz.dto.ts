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
