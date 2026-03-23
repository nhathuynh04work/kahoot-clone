"use client";

import { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { AdminDashboardStatsResponse } from "@/features/admin/api/server-actions";
import { StatTile } from "@/components/ui/stat-tile";

function formatDateTick(date: string) {
	// date is "YYYY-MM-DD"
	return typeof date === "string" ? date.slice(5) : date;
}

export function AdminDashboardStats({ stats }: { stats: AdminDashboardStatsResponse }) {
	const avgAccuracyChartData = useMemo(() => {
		return stats.charts.avgAccuracyOverTime.map((p) => ({
			date: p.date,
			percent: Math.round((p.avgAccuracy ?? 0) * 1000) / 10, // 1 decimal
		}));
	}, [stats.charts.avgAccuracyOverTime]);

	const topQuizzesChartData = useMemo(() => {
		return stats.charts.topQuizzes.map((q) => ({
			quizId: q.quizId,
			title: q.title,
			sessions: q.sessions,
		}));
	}, [stats.charts.topQuizzes]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<StatTile label="Total users" value={stats.totals.users} />
				<StatTile label="Total quizzes" value={stats.totals.quizzes} />
				<StatTile label="Total documents" value={stats.totals.documents} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">User growth</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={stats.charts.userGrowth} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Line type="monotone" dataKey="count" name="Users" stroke="#6366f1" strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Quiz growth</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={stats.charts.quizGrowth} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Line type="monotone" dataKey="count" name="Quizzes" stroke="#10b981" strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Sessions played</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.charts.sessionsPlayed} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3 lg:col-span-1">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Active sessions</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.charts.activeSessions} layout="vertical" margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<YAxis dataKey="status" type="category" width={90} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="count" fill="#60a5fa" radius={[0, 6, 6, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3 lg:col-span-2">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Avg accuracy over time</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={avgAccuracyChartData} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={(v) => `${v}%`} allowDecimals={false} />
								<Tooltip formatter={(v) => [`${v}%`, "Avg accuracy"]} />
								<Line type="monotone" dataKey="percent" stroke="#ec4899" strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Top quizzes</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={topQuizzesChartData} layout="vertical" margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<YAxis dataKey="title" type="category" width={220} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="sessions" fill="#34d399" radius={[0, 6, 6, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Document status</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.charts.documentStatusBreakdown} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="status" tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	);
}

