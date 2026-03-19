import { Option, Question, Quiz } from "../../generated/prisma/client.js";

export type QuizWithQuestions = Quiz & {
    questions: Question[];
    authorName?: string | null;
};

export type QuizFullDetails = Quiz & {
    questions: QuestionWithOptions[];
    authorName?: string | null;
};

export type QuestionWithOptions = Question & { options: Option[] };
