import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useRouter } from "next/navigation";

export const useHostJoin = (lobbyId: number) => {
	const router = useRouter();

	useEffect(() => {
		socket.emit("hostJoin", { lobbyId }, (response: any) => {
			if (!response.success) {
				router.push("/dashboard");
			}
		});
	}, [lobbyId, router]);
};

export const usePlayerJoin = () => {};
