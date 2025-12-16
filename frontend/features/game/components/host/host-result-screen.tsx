"use client";

interface HostResultScreenProps {
	stats: Record<number, number>;
	correctOptionId: number;
}

export const HostResultScreen = ({
	stats,
	correctOptionId,
}: HostResultScreenProps) => {
	return (
		<div className="flex flex-col gap-10">
			<code>{JSON.stringify(stats)}</code>

			<p>Correct option: {correctOptionId}</p>
		</div>
	);
};
