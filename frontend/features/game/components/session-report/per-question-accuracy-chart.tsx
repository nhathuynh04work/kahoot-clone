"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SessionReport } from "@/features/game/api/server-actions";

export interface PerQuestionAccuracyChartProps {
	report: SessionReport;
	limit?: number;
}

export function PerQuestionAccuracyChart({
	report,
	limit = 10,
}: PerQuestionAccuracyChartProps) {
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
