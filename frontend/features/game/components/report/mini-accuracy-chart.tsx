"use client";

import {
	PolarAngleAxis,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
} from "recharts";

export interface ReportMiniAccuracyChartProps {
	value: number; // 0..1
	label?: string;
}

export function ReportMiniAccuracyChart({
	value,
	label,
}: ReportMiniAccuracyChartProps) {
	const safe = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
	const percent = safe * 100;
	const data = [{ name: label, value: percent }];

	return (
		<div className="relative w-14 h-14 overflow-visible">
			<ResponsiveContainer width="100%" height="100%">
				<RadialBarChart
					data={data}
					startAngle={90}
					endAngle={-270}
					innerRadius="70%"
					outerRadius="100%"
				>
					<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
					<RadialBar
						dataKey="value"
						cornerRadius={999}
						background={{ fill: "var(--app-border)" }}
						fill="#6366f1"
					/>
				</RadialBarChart>
			</ResponsiveContainer>
			<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
				<div className="text-[11px] leading-none font-semibold text-(--app-fg) tabular-nums">
					{percent.toFixed(0)}%
				</div>
				{label ? (
					<div className="mt-1 text-[10px] leading-none text-(--app-fg-muted)">
						{label}
					</div>
				) : null}
			</div>
		</div>
	);
}
