"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import * as quizApi from "../actions/quiz";
import { useRouter } from "next/navigation";
import { QuestionWithOptions, Option } from "@/lib/types/quiz";
import {
	UpdateOptionDto,
	UpdateQuestionDto,
	CreateOptionDto,
} from "@/lib/dtos/quiz.dto";

type UpdateQuestionOptions = UseMutationOptions<
	QuestionWithOptions,
	Error,
	UpdateQuestionDto
>;

type AddOptionOptions = UseMutationOptions<Option, Error, CreateOptionDto>;

type UpdateOptionOptions = UseMutationOptions<
	Option,
	Error,
	{ optionId: number; payload: UpdateOptionDto }
>;

type DeleteQuestionOptions = UseMutationOptions<void, Error, void>;

type DeleteOptionOptions = UseMutationOptions<
	void,
	Error,
	{ optionId: number }
>;

export function useUpdateQuestion(
	question: QuestionWithOptions,
	options?: Pick<UpdateQuestionOptions, "onSuccess" | "onError">
) {
	const router = useRouter();

	return useMutation({
		mutationFn: (payload: UpdateQuestionDto) =>
			quizApi.updateQuestion({
				questionId: question.id,
				quizId: question.quizId,
				payload,
			}),
		onSuccess: (data, variables, result, context) => {
			options?.onSuccess?.(data, variables, result, context);
			router.refresh();
		},
		onError: (error, variables, result, context) => {
			options?.onError?.(error, variables, result, context);
			console.error("Failed to update question", error);
		},
	});
}

export function useDeleteQuestion(
	question: QuestionWithOptions,
	options?: Pick<DeleteQuestionOptions, "onSuccess" | "onError">
) {
	const router = useRouter();

	return useMutation({
		mutationFn: () =>
			quizApi.deleteQuestion({
				questionId: question.id,
				quizId: question.quizId,
			}),
		onSuccess: (data, variables, result, context) => {
			options?.onSuccess?.(data, variables, result, context);
			router.refresh();
		},
		onError: (error, variables, result, context) => {
			options?.onError?.(error, variables, result, context);
			console.error("Failed to delete question", error);
		},
	});
}

export function useAddOption(
	question: QuestionWithOptions,
	options?: Pick<AddOptionOptions, "onSuccess" | "onError">
) {
	const router = useRouter();

	return useMutation({
		mutationFn: (payload: CreateOptionDto) =>
			quizApi.addOption({
				questionId: question.id,
				quizId: question.quizId,
				payload,
			}),
		onSuccess: (data, variables, result, context) => {
			options?.onSuccess?.(data, variables, result, context);
			router.refresh();
		},
		onError: (error, variables, result, context) => {
			options?.onError?.(error, variables, result, context);
			console.error("Failed to add option", error);
		},
	});
}

export function useUpdateOption(
	question: QuestionWithOptions,
	options?: Pick<UpdateOptionOptions, "onSuccess" | "onError">
) {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { optionId: number; payload: UpdateOptionDto }) =>
			quizApi.updateOption({
				quizId: question.quizId,
				questionId: question.id,
				optionId: data.optionId,
				payload: data.payload,
			}),
		onSuccess: (data, variables, result, context) => {
			options?.onSuccess?.(data, variables, result, context);
			router.refresh();
		},
		onError: (error, variables, result, context) => {
			options?.onError?.(error, variables, result, context);
			console.error("Failed to update option", error);
		},
	});
}

export function useDeleteOption(
	question: QuestionWithOptions,
	options?: Pick<DeleteOptionOptions, "onSuccess" | "onError">
) {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { optionId: number }) =>
			quizApi.deleteOption({
				quizId: question.quizId,
				questionId: question.id,
				optionId: data.optionId,
			}),
		onSuccess: (data, variables, result, context) => {
			options?.onSuccess?.(data, variables, result, context);
			router.refresh();
		},
		onError: (error, variables, result, context) => {
			options?.onError?.(error, variables, result, context);
			console.error("Failed to delete option", error);
		},
	});
}
