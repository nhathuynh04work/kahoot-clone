"use server";

import { apiServer } from "@/lib/apiServer";
import {
	CreateOptionDto,
	UpdateOptionDto,
	UpdateQuestionDto,
} from "@/lib/dtos/quiz.dto";
import {
	Option,
	Question,
	QuizFullDetails,
	QuizWithQuestions,
} from "@/lib/types/quiz";
import { revalidatePath } from "next/cache";
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

export async function addQuestion(quizId: number): Promise<Question> {
	const api = await apiServer();
	const { data } = await api.post(`/quiz/${quizId}/questions`);
	return data;
}

export async function updateQuestion(params: {
	questionId: number;
	quizId: number;
	payload: UpdateQuestionDto;
}) {
	const { questionId, quizId, payload } = params;

	const api = await apiServer();
	const { data } = await api.patch(
		`/quiz/${quizId}/questions/${questionId}`,
		payload
	);
	return data;
}

export async function deleteQuestion(params: {
	questionId: number;
	quizId: number;
}) {
	const { questionId, quizId } = params;
	const api = await apiServer();
	await api.delete(`/quiz/${quizId}/questions/${questionId}`);
	revalidatePath(`/quiz/edit/${quizId}`);
}

export async function addOption(params: {
	quizId: number;
	questionId: number;
	payload: CreateOptionDto;
}): Promise<Option> {
	const { quizId, questionId, payload } = params;
	const api = await apiServer();
	const { data } = await api.post(
		`/quiz/${quizId}/questions/${questionId}/options`,
		payload
	);

	revalidatePath(`/quiz/edit/${quizId}`);
	return data;
}

export async function updateOption(params: {
	quizId: number;
	questionId: number;
	optionId: number;
	payload: UpdateOptionDto;
}): Promise<Option> {
	const { quizId, questionId, optionId, payload } = params;

	const api = await apiServer();
	const { data } = await api.patch(
		`/quiz/${quizId}/questions/${questionId}/options/${optionId}`,
		payload
	);

	revalidatePath(`/quiz/edit/${quizId}`);
	return data;
}

export async function deleteOption(params: {
	quizId: number;
	questionId: number;
	optionId: number;
}) {
	const { quizId, questionId, optionId } = params;

	const api = await apiServer();
	await api.delete(
		`/quiz/${quizId}/questions/${questionId}/options/${optionId}`
	);

	revalidatePath(`/quiz/edit/${quizId}`);
}
