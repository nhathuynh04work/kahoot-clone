"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateLobby(quizId: number) {
	const router = useRouter();

	return useMutation({
		mutationFn: async () => {
			return { quizId };
		},
		onSuccess: () => {
			router.push(`/game/host?quizId=${quizId}`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
