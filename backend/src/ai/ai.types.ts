export interface GeneratedOption {
    text: string;
    isCorrect: boolean;
}

export interface GeneratedQuestion {
    text: string;
    options: GeneratedOption[];
}

export interface GenerateQuestionsResult {
    questions: GeneratedQuestion[];
}

