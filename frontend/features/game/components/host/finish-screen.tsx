import { LeaderboardItem } from "../../hooks/use-host-reducer";

interface HostFinishScreenProps {
	leaderboard: LeaderboardItem[];
}

export default function HostFinishScreen({
	leaderboard,
}: HostFinishScreenProps) {
	const top3 = leaderboard.slice(0, 3);
	const runnersUp = leaderboard.slice(3, 10);

	return (
		<div className="flex flex-col h-full w-full max-w-6xl mx-auto p-6">
			<h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
				Podium
			</h1>

			{/* Podium Section */}
			<div className="flex items-end justify-center gap-4 mb-12 min-h-[400px]">
				{/* 2nd Place */}
				{top3[1] && (
					<div className="flex flex-col items-center w-1/4 animate-bounce-in-left">
						<div className="mb-2 text-center">
							<p className="font-bold text-xl text-gray-700">
								{top3[1].nickname}
							</p>
							<p className="text-gray-500">{top3[1].score} pts</p>
						</div>
						<div className="w-full bg-slate-300 h-48 rounded-t-lg flex items-center justify-center shadow-lg border-t-4 border-slate-400">
							<span className="text-4xl font-bold text-slate-500">
								2
							</span>
						</div>
					</div>
				)}

				{/* 1st Place */}
				{top3[0] && (
					<div className="flex flex-col items-center w-1/3 z-10 animate-bounce-in-up">
						<div className="mb-4 text-center">
							<div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold mb-2">
								WINNER
							</div>
							<p className="font-bold text-3xl text-gray-800">
								{top3[0].nickname}
							</p>
							<p className="text-xl text-blue-600 font-bold">
								{top3[0].score} pts
							</p>
						</div>
						<div className="w-full bg-yellow-400 h-64 rounded-t-lg flex items-center justify-center shadow-xl border-t-4 border-yellow-300 relative overflow-hidden">
							{/* Shine effect */}
							<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
							<span className="text-6xl font-bold text-yellow-700">
								1
							</span>
						</div>
					</div>
				)}

				{/* 3rd Place */}
				{top3[2] && (
					<div className="flex flex-col items-center w-1/4 animate-bounce-in-right">
						<div className="mb-2 text-center">
							<p className="font-bold text-xl text-gray-700">
								{top3[2].nickname}
							</p>
							<p className="text-gray-500">{top3[2].score} pts</p>
						</div>
						<div className="w-full bg-orange-300 h-32 rounded-t-lg flex items-center justify-center shadow-lg border-t-4 border-orange-400">
							<span className="text-4xl font-bold text-orange-600">
								3
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Runners Up List */}
			{runnersUp.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border max-w-2xl mx-auto w-full overflow-hidden">
					{runnersUp.map((player, index) => (
						<div
							key={index}
							className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50">
							<div className="flex items-center gap-4">
								<span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-600">
									{index + 4}
								</span>
								<span className="font-medium text-gray-800">
									{player.nickname}
								</span>
							</div>
							<span className="font-bold text-gray-600">
								{player.score}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
