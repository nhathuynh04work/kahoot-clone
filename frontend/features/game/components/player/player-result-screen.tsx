"use client";

interface PlayerResultScreenProps {
	isCorrect: boolean;
	points: number;
}

export const PlayerResultScreen = ({
	isCorrect,
	points,
}: PlayerResultScreenProps) => {
	return (
		<div className="flex flex-col gap-10">
			<p>Your answer is {isCorrect ? "correct" : "incorrect"}</p>

			<p>Total points earned: {points}</p>
		</div>
	);
};
