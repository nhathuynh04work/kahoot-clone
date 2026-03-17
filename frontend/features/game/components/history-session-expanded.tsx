"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	getSessionReport,
	type SessionReport,
} from "@/features/game/api/server-actions";

function StatTile({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: React.ReactNode;
	tone?: "default" | "accent";
}) {
	return (
		<div
			className={cn(
				"rounded-lg border p-3",
				"bg-gray-900/40 border-gray-700",
				tone === "accent" && "border-indigo-500/40",
			)}
		>
			<p className="text-gray-400 text-xs">{label}</p>
			<p
				className={cn(
					"mt-1 font-semibold text-white tabular-nums",
					tone === "accent" && "text-indigo-300",
				)}
			>
				{value}
			</p>
		</div>
	);
}

export function HistorySessionExpanded({ lobbyId }: { lobbyId: number }) {
	const [report, setReport] = useState<SessionReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		setReport(null);

		getSessionReport(lobbyId)
			.then((r) => {
				if (cancelled) return;
				setReport(r);
			})
			.catch((e) => {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Failed to load report");
			})
			.finally(() => {
				if (cancelled) return;
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [lobbyId]);

	const perQuestion = useMemo(() => {
		if (!report) return [];
		const sorted = [...report.questions].sort((a, b) => a.sortIndex - b.sortIndex);
		return sorted.slice(0, 8).map((q, idx) => ({
			name: `Q${idx + 1}`,
			value: Math.round((q.correctRate ?? 0) * 100),
		}));
	}, [report]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-6">
				<Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
			</div>
		);
	}

	if (error) {
		return <p className="text-sm text-red-400">{error}</p>;
	}

	if (!report) return null;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<StatTile label="Players" value={report.aggregates.totalPlayers} />
				<StatTile label="Questions" value={report.aggregates.totalQuestions} />
				<StatTile
					label="Avg accuracy"
					value={`${(report.aggregates.avgAccuracy * 100).toFixed(1)}%`}
					tone="accent"
				/>
				<StatTile
					label="Answers"
					value={`${report.aggregates.totalCorrect}/${report.aggregates.totalAnswers}`}
				/>
			</div>

			<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-medium text-white">
						Per-question accuracy
					</p>
					<p className="text-xs text-gray-400">
						First {perQuestion.length} questions
					</p>
				</div>
				<div className="mt-3 h-40">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={perQuestion} margin={{ left: 8, right: 8 }}>
							<XAxis
								dataKey="name"
								tick={{ fill: "#9ca3af", fontSize: 12 }}
								axisLine={{ stroke: "rgba(55, 65, 81, 0.8)" }}
								tickLine={false}
							/>
							<YAxis
								domain={[0, 100]}
								tick={{ fill: "#9ca3af", fontSize: 12 }}
								axisLine={{ stroke: "rgba(55, 65, 81, 0.8)" }}
								tickLine={false}
								width={32}
								tickFormatter={(v) => `${v}%`}
							/>
							<Tooltip
								cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
								contentStyle={{
									background: "rgba(17, 24, 39, 0.95)",
									border: "1px solid rgba(55, 65, 81, 0.9)",
									color: "#fff",
									borderRadius: 10,
								}}
								labelStyle={{ color: "#e5e7eb" }}
								formatter={(v) => [`${v}%`, "Accuracy"]}
							/>
							<Bar
								dataKey="value"
								fill="#6366f1"
								radius={[8, 8, 2, 2]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<p className="mt-2 text-xs text-gray-500">
					Tip: open “View report” for full details (leaderboard, per-question
					breakdown).
				</p>
			</div>
		</div>
	);
}

