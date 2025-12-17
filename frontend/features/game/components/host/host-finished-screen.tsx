"use client";

import { Player } from "../../types";

interface HostFinishedScreenProps {
	leaderboard: Player[];
}

export const HostFinishedScreen = ({
	leaderboard,
}: HostFinishedScreenProps) => {
	const sliced = leaderboard.slice(0, 9);

	return (
		<div className="flex flex-col gap-6">
			<code>{JSON.stringify(leaderboard)}</code>

			<div className="flex flex-col gap-4">
				{sliced.map((p, i) => (
					<div key={p.nickname}>
						#{i + 1}. {p.nickname} - {p.points}
					</div>
				))}
			</div>
		</div>
	);
};
