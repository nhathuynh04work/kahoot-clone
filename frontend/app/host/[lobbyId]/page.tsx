"use client";

import { socket } from "@/features/game/lib/socket";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HostGameScreen() {
	const { lobbyId } = useParams();
	const router = useRouter();

	if (!lobbyId) {
		router.push("/dashboard");
	}

	useEffect(() => {
		socket.emit("hostJoin", { lobbyId }, (response: any) => {
			if (!response.success) {
				router.push("/dashboard");
			}
		});
	}, [lobbyId, router]);
}
