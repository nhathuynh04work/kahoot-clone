"use client";

export default function WaitingScreen({ pin }: { pin: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-white">
			<h1 className="text-4xl font-bold mb-4">You&apos;re in!</h1>
			<p className="text-2xl text-gray-300">Get ready to play...</p>
			<p className="mt-8 text-lg">Game PIN: {pin}</p>
		</div>
	);
}
