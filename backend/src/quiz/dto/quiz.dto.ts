import { Option, Question, Quiz } from "../../generated/prisma/client.js";

export type QuizWithQuestions = Quiz & {
    questions: Question[];
    authorName?: string | null;
    saveCount?: number;
    playCount?: number;
};

export type QuizFullDetails = Quiz & {
    questions: QuestionWithOptions[];
    authorName?: string | null;
    saveCount?: number;
    playCount?: number;
};

export type QuestionWithOptions = Question & { options: Option[] };
