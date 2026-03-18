"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SessionReport } from "@/features/game/api/server-actions";
import { cn } from "@/lib/utils";

export function SessionStatTiles({ report }: { report: SessionReport }) {
	return (
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
	);
}

export function PerQuestionAccuracyChart({
	report,
	limit = 10,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const data = useMemo(() => {
		const sorted = [...report.questions].sort((a, b) => a.sortIndex - b.sortIndex);
		return sorted.slice(0, limit).map((q, idx) => ({
			name: `Q${idx + 1}`,
			value: Math.round((q.correctRate ?? 0) * 100),
		}));
	}, [report.questions, limit]);

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Per-question accuracy</p>
				<p className="text-xs text-gray-400">First {data.length} questions</p>
			</div>
			<div className="mt-3 h-44">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} margin={{ left: 8, right: 8 }}>
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
						<Bar dataKey="value" fill="#6366f1" radius={[8, 8, 2, 2]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

export function PerQuestionStatsList({
	report,
	limit,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const rows = useMemo(() => {
		const sorted = [...report.questions].sort((a, b) => a.sortIndex - b.sortIndex);
		const sliced = typeof limit === "number" ? sorted.slice(0, limit) : sorted;
		return sliced.map((q, idx) => {
			const total = (q.correctCount ?? 0) + (q.incorrectCount ?? 0);
			const accuracy =
				Number.isFinite(q.correctRate) && q.correctRate !== null
					? Math.round((q.correctRate ?? 0) * 100)
					: total > 0
						? Math.round(((q.correctCount ?? 0) / total) * 100)
						: 0;
			return {
				key: `${q.questionId}-${q.sortIndex}-${idx}`,
				label: `Q${idx + 1}`,
				text: q.question?.text?.trim() || "—",
				correct: q.correctCount ?? 0,
				incorrect: q.incorrectCount ?? 0,
				accuracy,
			};
		});
	}, [report.questions, limit]);

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Per-question stats</p>
				<p className="text-xs text-gray-400">
					{rows.length} question{rows.length === 1 ? "" : "s"}
				</p>
			</div>

			<div className="mt-3 space-y-2">
				{rows.map((r) => (
					<div
						key={r.key}
						className={cn(
							"rounded-md border px-3 py-2",
							"bg-gray-900/40 border-gray-700/60",
						)}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="text-xs text-gray-400">{r.label}</p>
								<p className="mt-0.5 text-sm text-white truncate">{r.text}</p>
							</div>
							<div className="shrink-0 text-right tabular-nums">
								<p className="text-sm font-semibold text-indigo-300">
									{r.accuracy}%
								</p>
								<p className="text-xs text-gray-400">
									{r.correct}✓ / {r.incorrect}✕
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function LeaderboardList({
	report,
	limit = 10,
}: {
	report: SessionReport;
	limit?: number;
}) {
	const entries = report.leaderboard.slice(0, limit);
	return (
		<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-white">Leaderboard</p>
				<p className="text-xs text-gray-400">Top {entries.length}</p>
			</div>
			<div className="mt-3 space-y-1">
				{entries.map((entry, i) => (
					<div
						key={`${entry.nickname}-${i}`}
						className="flex justify-between items-center py-2 px-3 rounded-md bg-gray-900/40 border border-gray-700/60"
					>
						<span className="text-white text-sm">
							{i + 1}. {entry.nickname}
						</span>
						<span className="text-indigo-300 text-sm font-semibold tabular-nums">
							{entry.points} pts
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

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

