"use client";

interface HostResultScreenProps {
	stats: Record<string, string>;
	correctOptionId: number;
	onNext: () => void;
}

export const HostResultScreen = ({
	stats,
	correctOptionId,
	onNext,
}: HostResultScreenProps) => {
	return (
		<div className="flex flex-col gap-10">
			<button className="p-6 border" onClick={onNext}>
				Next
			</button>
			<code>{JSON.stringify(stats)}</code>

			<p>Correct option: {correctOptionId}</p>
		</div>
	);
};
