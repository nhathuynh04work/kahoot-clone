"use client";

import { useEffect, useState } from "react";
import {
	getRecentSessions,
	type RecentSessionsResponse,
} from "@/features/game/api/server-actions";
import { SessionReportModal } from "./session-report-modal";
import { Loader2 } from "lucide-react";

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function HistoryPageClient() {
	const [data, setData] = useState<RecentSessionsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedLobbyId, setSelectedLobbyId] = useState<number | null>(null);

	useEffect(() => {
		getRecentSessions({ limit: 30 })
			.then(setData)
			.catch(() => setData({ items: [], nextCursor: null }))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	if (!data || data.items.length === 0) {
		return (
			<div className="text-center bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-700">
				<h3 className="text-xl font-medium text-white">
					No sessions yet
				</h3>
				<p className="text-gray-400 my-2">
					Complete a quiz game to see session reports here.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-lg border border-gray-700 overflow-hidden">
				<table className="w-full text-left">
					<thead className="bg-gray-800/80 text-gray-400 text-sm">
						<tr>
							<th className="px-4 py-3 font-medium">Quiz</th>
							<th className="px-4 py-3 font-medium">Date</th>
							<th className="px-4 py-3 font-medium">Players</th>
							<th className="px-4 py-3 font-medium">Accuracy</th>
							<th className="px-4 py-3 font-medium"></th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-700">
						{data.items.map((item) => (
							<tr
								key={item.lobbyId}
								className="hover:bg-gray-800/50 transition-colors">
								<td className="px-4 py-3 text-white font-medium">
									{item.quizTitle}
								</td>
								<td className="px-4 py-3 text-gray-400 text-sm">
									{formatDate(item.endedAt ?? item.createdAt)}
								</td>
								<td className="px-4 py-3 text-gray-300">
									{item.totalPlayers}
								</td>
								<td className="px-4 py-3 text-gray-300">
									{(item.avgAccuracy * 100).toFixed(1)}%
								</td>
								<td className="px-4 py-3">
									<button
										type="button"
										onClick={() =>
											setSelectedLobbyId(item.lobbyId)
										}
										className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
										View
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{selectedLobbyId !== null && (
				<SessionReportModal
					lobbyId={selectedLobbyId}
					onClose={() => setSelectedLobbyId(null)}
				/>
			)}
		</>
	);
}
