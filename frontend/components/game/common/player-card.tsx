"use client";

import { Player } from "@/lib/types/game";

export default function PlayerCard({ player }: { player: Player }) {
	const renderStatus = () => {
		if (player.isHost) {
			return <span className="text-sm text-indigo-400">Host</span>;
		}

		if (typeof player.score === "number") {
			return (
				<span className="font-medium text-lg text-white">
					{player.score} pts
				</span>
			);
		}

		return <span className="text-sm text-gray-400">Joined</span>;
	};

	return (
		<div
			key={player.id}
			className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
			{/* Player Nickname */}
			<span className="font-medium text-lg">{player.nickname}</span>

			{/* Status (Host, Score, or Joined) */}
			{renderStatus()}
		</div>
	);
}
