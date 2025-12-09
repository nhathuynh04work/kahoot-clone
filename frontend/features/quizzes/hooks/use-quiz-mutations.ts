"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createQuiz, updateQuiz } from "../api/client-actions";

export const useCreateQuiz = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: createQuiz,
		onSuccess: () => {
			router.refresh();
		},
	});
};

export const useUpdateQuiz = () => {
	return useMutation({
		mutationFn: updateQuiz,
	});
};
