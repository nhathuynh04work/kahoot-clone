"use client";

interface PlayerFinishedScreenProps {
	nickname: string;
	points: number;
	rank: number;
}

export const PlayerFinishedScreen = ({
	nickname,
	points,
	rank,
}: PlayerFinishedScreenProps) => {
	return (
		<div className="text-bold">
			#{rank + 1}. {nickname} - {points}
		</div>
	);
};
