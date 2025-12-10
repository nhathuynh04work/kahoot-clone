"use client";

import { Player } from "../../types";
import PinDisplay from "../common/pin-display";
import PlayerCard from "../common/player-card";
import StartButton from "./start-button";

interface Props {
	pin: string;
	players: Player[];
	onStartGame: () => void;
}

export default function WaitingScreen({ pin, onStartGame, players }: Props) {
	return (
		<div className="p-8 max-w-4xl mx-auto text-white">
			{/* Game PIN Display */}
			<PinDisplay pin={pin} />

			{/* Players List and Control Panel */}
			<div className="bg-gray-800 p-6 rounded-lg shadow-xl">
				<div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
					<h3 className="text-2xl font-semibold">
						Players ({players.length})
					</h3>
					<StartButton
						onClick={onStartGame}
						disabled={players.length < 2}
					/>
				</div>

				<div className="space-y-3 max-h-96 overflow-y-auto">
					{players.map((player) => (
						<PlayerCard key={player.id} player={player} />
					))}
				</div>
			</div>
		</div>
	);
}
