"use client";

interface RejoinDialogProps {
	onContinue: () => void;
	onStartFresh: () => void;
}

export function RejoinDialog({ onContinue, onStartFresh }: RejoinDialogProps) {
	const nickname = JSON.parse(localStorage.getItem("recovery")!).nickname;

	return (
		<p>
			rejoin
			<button onClick={onContinue}>Continue as {nickname}</button>
			<button onClick={onStartFresh}>Start fresh</button>
		</p>
	);
}
