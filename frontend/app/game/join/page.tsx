import { Suspense } from "react";
import { GameJoinClient } from "@/features/game/pages/game-join-client";

function Loading() {
	return (
		<div className="min-h-dvh flex items-center justify-center px-6 text-(--app-fg)">
			<div className="w-full max-w-md rounded-2xl border border-(--app-border) bg-(--app-surface-muted)/80 p-6 text-center">
				<div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
				<p className="text-lg font-semibold">Loading…</p>
			</div>
		</div>
	);
}

export default function GameJoinPage() {
	return (
		<Suspense fallback={<Loading />}>
			<GameJoinClient />
		</Suspense>
	);
}

