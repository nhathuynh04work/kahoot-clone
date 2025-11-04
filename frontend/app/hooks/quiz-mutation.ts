"use client";

import { useMutation } from "@tanstack/react-query";
import * as quizApi from "../actions/quiz";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types/quiz";
import {
	CreateOptionDto,
	UpdateOptionDto,
	UpdateQuestionDto,
} from "@/lib/dtos/quiz.dto";

export function useUpdateQuestion(question: Question) {
	const router = useRouter();

	return useMutation({
		mutationFn: (payload: UpdateQuestionDto) =>
			quizApi.updateQuestion({
				questionId: question.id,
				quizId: question.quizId,
				payload,
			}),
		onSuccess: () => router.refresh(),
		onError: (err) => console.error("Failed to update question", err),
	});
}

export function useAddOption(question: Question) {
	const router = useRouter();

	return useMutation({
		mutationFn: (payload: CreateOptionDto) =>
			quizApi.addOption({
				questionId: question.id,
				quizId: question.quizId,
				payload,
			}),
		onSuccess: () => router.refresh(),
		onError: (err) => console.error("Failed to add option", err),
	});
}

export function useUpdateOption(question: Question) {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { optionId: number; payload: UpdateOptionDto }) =>
			quizApi.updateOption({
				quizId: question.quizId,
				questionId: question.id,
				optionId: data.optionId,
				payload: data.payload,
			}),

		onSuccess: () => router.refresh(),
		onError: (err) => console.error("Failed to update option", err),
	});
}
