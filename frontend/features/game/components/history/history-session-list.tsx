"use client";

import { HistorySessionCard } from "../history-session-card";
import type { SessionListItem } from "@/features/game/api/server-actions";

export function HistorySessionList({
	items,
	onOpenQuizDetails,
	quizTitleLoadingId,
	hrefForLobbyId,
}: {
	items: SessionListItem[];
	onOpenQuizDetails: (quizId: number) => void;
	quizTitleLoadingId: number | null;
	hrefForLobbyId: (lobbyId: number) => string;
}) {
	return (
		<div className="space-y-4">
			{items.map((item) => (
				<HistorySessionCard
					key={item.lobbyId}
					item={item}
					href={hrefForLobbyId(item.lobbyId)}
					quizTitleLoading={quizTitleLoadingId === item.quizId}
					onQuizTitleClick={() => onOpenQuizDetails(item.quizId)}
				/>
			))}
		</div>
	);
}

