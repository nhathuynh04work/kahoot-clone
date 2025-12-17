"use client";

import {
	ArrowRight,
	BarChart2,
	Check,
	Circle,
	Hexagon,
	Square,
	Triangle,
} from "lucide-react";

interface HostResultScreenProps {
	stats: Record<string, string>;
	correctOptionId: number;
	onNext: () => void;
}

const getBarColor = (index: number) => {
	const colors = [
		"bg-red-500",
		"bg-blue-500",
		"bg-yellow-500",
		"bg-green-500",
	];
	return colors[index % 4];
};

const getIcon = (index: number) => {
	const icons = [Triangle, Hexagon, Circle, Square];
	return icons[index % 4];
};

export const HostResultScreen = ({
	stats,
	correctOptionId,
	onNext,
}: HostResultScreenProps) => {
	const sortedStats = Object.entries(stats).sort(
		(a, b) => parseInt(a[0]) - parseInt(b[0])
	);
	const values = sortedStats.map(([, count]) => parseInt(count) || 0);
	const maxCount = Math.max(...values, 1);

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 p-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
						<BarChart2 className="text-indigo-400" size={24} />
					</div>
					<h2 className="text-2xl font-bold text-white">Results</h2>
				</div>
				<button
					onClick={onNext}
					className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
					Next Question <ArrowRight size={18} />
				</button>
			</div>

			{/* Chart Area */}
			<div className="flex-1 min-h-[400px] flex items-end justify-center gap-4 md:gap-8 pb-12 px-4 max-w-5xl mx-auto w-full">
				{sortedStats.map(([optionId, countStr], index) => {
					const count = parseInt(countStr);
					const isCorrect = parseInt(optionId) === correctOptionId;
					const Icon = getIcon(index);
					const heightPercent = (count / maxCount) * 100;

					return (
						<div
							key={optionId}
							className="flex flex-col items-center justify-end w-full max-w-[120px] h-[60vh] group">
							{/* Bar (Grows upwards) */}
							<div
								className={`w-full relative transition-all duration-1000 ease-out rounded-t-sm ${getBarColor(
									index
								)} ${
									!isCorrect
										? "opacity-50"
										: "opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
								}`}
								style={{ height: `${heightPercent}%` }}
							/>

							{/* Base Info: Count & Indicator */}
							<div className="w-full bg-gray-800 rounded-b-lg p-3 flex justify-center items-center gap-2 border-t-4 border-gray-900 shadow-sm z-10">
								{/* 1. Icon */}
								<Icon
									className={`${getBarColor(index).replace(
										"bg-",
										"text-"
									)} w-8 h-8 fill-current bg-opacity-0`}
									strokeWidth={3}
								/>

								{/* 2. Count */}
								<span className="text-white font-bold text-xl">
									{count}
								</span>

								{/* 3. Correct Indicator */}
								{isCorrect && (
									<div className="h-6 flex items-center justify-center">
										<Check
											className="text-green-400 w-6 h-6"
											strokeWidth={4}
										/>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
