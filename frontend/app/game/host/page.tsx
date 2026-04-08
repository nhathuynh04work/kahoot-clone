"use client";

import { useSearchParams } from "next/navigation";
import HostGamePage from "@/features/game/pages/host-game-page";

export default function GameHostQueryPage() {
	const params = useSearchParams();
	const quizId = Number(params.get("quizId"));

	return <HostGamePage quizId={quizId} />;
}

