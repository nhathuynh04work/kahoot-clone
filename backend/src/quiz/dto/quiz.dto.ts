import { Question, Quiz } from "../../generated/prisma/client.js";
import { QuestionWithOptions } from "../../question/dto/question.dto.js";

export type QuizWithQuestions = Quiz & {
    questions: Question[];
};

export type QuizFullDetails = Quiz & {
    questions: QuestionWithOptions[];
};
