import { Option, Question, Quiz } from "../../generated/prisma/client.js";

export type QuizWithQuestions = Quiz & {
    questions: Question[];
};

export type QuizFullDetails = Quiz & {
    questions: QuestionWithOptions[];
};

export type QuestionWithOptions = Question & { options: Option[] };
