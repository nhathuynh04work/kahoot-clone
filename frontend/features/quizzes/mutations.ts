"use client";

import { apiClient as api } from "@/lib/apiClient";
import { Quiz, QuizFullDetails } from "@/lib/types/quiz";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCreateQuiz() {
	const router = useRouter();

	return useMutation({
		mutationFn: async () => {
			const { data } = await api.post("/quiz");
			return data as Quiz;
		},
		onSuccess: () => {
			router.refresh();
		},
	});
}

export function useUpdateQuiz() {
	return useMutation({
		mutationFn: async (payload: QuizFullDetails) => {
			const { data } = await api.patch(`/quiz/${payload.id}`);
			return data as QuizFullDetails;
		},
	});
}
