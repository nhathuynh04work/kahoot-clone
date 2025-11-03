"use server";

import { apiServer } from "@/lib/apiServer";
import { UpdateQuestionDto } from "@/lib/dtos/quiz.dto";
import { Question, QuizFullDetails, QuizWithQuestions } from "@/lib/types/quiz";
import { redirect } from "next/navigation";

export async function getQuiz(id: string): Promise<QuizFullDetails> {
	const api = await apiServer();
	const { data } = await api.get(`/quiz/${id}`);
	return data;
}

export async function getQuizzes(): Promise<QuizWithQuestions[]> {
	const api = await apiServer();
	const { data } = await api.get("/quiz");
	return data;
}

export async function createQuiz() {
	const api = await apiServer();
	const { data } = await api.post("/quiz");
	redirect(`/quiz/edit/${data.id}`);
}

export async function addQuestion(quizId: number | string): Promise<Question> {
	const api = await apiServer();
	const { data } = await api.post(`/quiz/${quizId}/questions`);
	return data;
}

export async function updateQuestion({
	questionId,
	quizId,
	payload,
}: {
	questionId: number;
	quizId: number;
	payload: UpdateQuestionDto;
}) {
	const api = await apiServer();
	const { data } = await api.patch(
		`/quiz/${quizId}/questions/${questionId}`,
		payload
	);
	return data;
}
