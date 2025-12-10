"use client";

interface PlayerResultScreenProps {
	isCorrect: boolean | null;
	score?: number;
}

export default function ResultScreen({ isCorrect }: PlayerResultScreenProps) {
	if (isCorrect === null) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
				<div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
					<div className="text-6xl mb-4">⏳</div>
					<h1 className="text-2xl font-bold text-gray-800 mb-2">
						Time&apos;s Up!
					</h1>
					<p className="text-gray-600">
						You didn&apos;t answer in time.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col items-center justify-center h-screen p-4 transition-colors duration-500 ${
				isCorrect ? "bg-green-600" : "bg-red-600"
			}`}>
			<div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
				{/* Icon */}
				<div className="mb-6 flex justify-center">
					{isCorrect ? (
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={4}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					) : (
						<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={4}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
					)}
				</div>

				{/* Text Feedback */}
				<h1 className="text-3xl font-black text-gray-900 mb-2">
					{isCorrect ? "Correct!" : "Incorrect"}
				</h1>

				<p className="text-gray-600 font-medium">
					{isCorrect
						? "Great job! Keep it up."
						: "Don't worry, you'll get the next one!"}
				</p>

				{/* Loading indicator for next state */}
				<div className="mt-8 pt-6 border-t border-gray-100">
					<div className="flex items-center justify-center gap-2 text-gray-500 text-sm animate-pulse">
						<span>Waiting for host...</span>
					</div>
				</div>
			</div>
		</div>
	);
}
