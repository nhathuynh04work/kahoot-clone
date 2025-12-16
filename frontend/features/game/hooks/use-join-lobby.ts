import { useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

export const useHostJoin = (lobbyId: number, onJoin: (pin: string) => void) => {
	const router = useRouter();
	const onJoinRef = useRef(onJoin);

	useEffect(() => {
		onJoinRef.current = onJoin;
	});

	useEffect(() => {
		socket.emit("hostJoin", { lobbyId }, (response: any) => {
			if (!response.success) {
				router.push("/dashboard");
				return;
			}

			if (onJoinRef.current) {
				onJoinRef.current(response.pin);
			}
		});
	}, [lobbyId, router]);
};

export const usePlayerJoin = (onJoin: (nickname: string) => void) => {
	const router = useRouter();
	const onJoinRef = useRef(onJoin);

	useEffect(() => {
		onJoinRef.current = onJoin;
	});

	useEffect(() => {
		const session = localStorage.getItem("recovery");
		if (!session) {
			router.push("/");
			return;
		}

		const { nickname, pin, rejoin } = JSON.parse(session);
		socket.emit(
			"playerJoin",
			{ pin, nickname, rejoin },
			(response: any) => {
				if (!response.success) {
					router.push("/");
					return;
				}

				if (onJoinRef.current) {
					onJoinRef.current(nickname);
				}
			}
		);
	}, [router]);
};
