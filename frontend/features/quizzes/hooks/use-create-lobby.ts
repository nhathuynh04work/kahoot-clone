"use client";

import { apiClient } from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateLobby(quizId: number) {
	const router = useRouter();

	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.post("/game/lobby", {
				quizId,
			});

			return data;
		},
		onSuccess: (lobby) => {
			router.push(`/host/${lobby.id}`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
