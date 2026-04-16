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
		<div className="rounded-lg border border-(--app-border) bg-(--app-surface-muted)/60 p-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-medium text-(--app-fg)">Per-question accuracy</p>
				<p className="text-xs text-(--app-fg-muted)">First {data.length} questions</p>
			</div>
			<div className="mt-3 h-44">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} margin={{ left: 8, right: 8 }}>
						<XAxis
							dataKey="name"
							tick={{ fill: "var(--app-fg-muted)", fontSize: 12 }}
							axisLine={{ stroke: "var(--app-border)" }}
							tickLine={false}
						/>
						<YAxis
							domain={[0, 100]}
							tick={{ fill: "var(--app-fg-muted)", fontSize: 12 }}
							axisLine={{ stroke: "var(--app-border)" }}
							tickLine={false}
							width={32}
							tickFormatter={(v) => `${v}%`}
						/>
						<Tooltip
							cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
							contentStyle={{
								background: "var(--app-elevated)",
								border: "1px solid var(--app-border)",
								color: "var(--app-fg)",
								borderRadius: 10,
							}}
							labelStyle={{ color: "var(--app-fg-muted)" }}
							formatter={(v) => [`${v}%`, "Accuracy"]}
						/>
						<Bar dataKey="value" fill="#6366f1" radius={[8, 8, 2, 2]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
