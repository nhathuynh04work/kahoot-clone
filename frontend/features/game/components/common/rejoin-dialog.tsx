"use client";

interface RejoinDialogProps {
	onContinue: () => void;
	onStartFresh: () => void;
}

export function RejoinDialog({ onContinue, onStartFresh }: RejoinDialogProps) {
	const nickname = JSON.parse(localStorage.getItem("recovery")!).nickname;

	return (
		<div className="w-full max-w-sm flex flex-col gap-4 p-8 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800">
			<h1 className="text-2xl font-bold text-center mb-4">
				Back in action?
			</h1>
			<button
				onClick={onContinue}
				className={`
                        w-full py-4 rounded-lg font-bold text-lg transition-all transform duration-200
                        flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 text-white cursor-pointer`}>
				Continue as {nickname}
			</button>
			<button
				onClick={onStartFresh}
				className={`
                        w-full py-4 rounded-lg font-bold text-lg transition-all transform duration-200
                        flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 hover:-translate-y-1 text-gray-700 cursor-pointer`}>
				Start fresh
			</button>
		</div>
	);
}
