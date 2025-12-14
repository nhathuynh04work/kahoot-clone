"use client";

import { Player } from "../../types";

interface HostWaitingScreenProps {
	pin: string;
	players: Player[];
	onStart: () => void;
}

export const HostWaitingScreen = ({
	pin,
	players,
	onStart,
}: HostWaitingScreenProps) => {
	return (
		<div className="flex flex-col gap-6">
			<button onClick={onStart} className="border px-4 py-2">
				Start
			</button>

			{/* Pin display */}
			<div className="text-xl">{pin}</div>

			{/* Player List */}
			<div className="flex flex-col gap-2">
				{players.map((player) => (
					<div key={player.nickname}>{player.nickname}</div>
				))}
			</div>
		</div>
	);
};
