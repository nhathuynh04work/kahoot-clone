import { useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type HostCreateLobbyResponse =
	| { success: true; lobbyId: number; pin: string }
	| { success: false; message?: string };

export function useHostCreateLobby(
	quizId: number,
	onCreated: (params: { lobbyId: number; pin: string }) => void
) {
	const router = useRouter();
	const onCreatedRef = useRef(onCreated);

	useEffect(() => {
		onCreatedRef.current = onCreated;
	});

	useEffect(() => {
		if (!Number.isFinite(quizId) || quizId <= 0) {
			router.push("/");
			return;
		}

		socket.emit(
			"hostCreateLobby",
			{ quizId },
			(response: HostCreateLobbyResponse) => {
				if (!response?.success) {
					toast.error(response?.message || "Could not start hosting this quiz");
					router.push("/library/quizzes");
					return;
				}

				onCreatedRef.current?.({
					lobbyId: response.lobbyId,
					pin: response.pin,
				});
			}
		);
	}, [quizId, router]);
}

