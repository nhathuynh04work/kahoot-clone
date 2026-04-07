"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	Cell,
	XAxis,
	YAxis,
} from "recharts";
import type { AdminDashboardStatsResponse } from "@/features/admin/api/server-actions";
import { StatTile } from "@/components/ui/stat-tile";
import { AdminDashboardRangeSelector } from "@/features/admin/components/admin-dashboard-range-selector";

function formatDateTick(date: string) {
	// date is "YYYY-MM-DD"
	return typeof date === "string" ? date.slice(5) : date;
}

export function AdminDashboardStats({
	stats,
	rangeDays,
}: {
	stats: AdminDashboardStatsResponse;
	rangeDays: number;
}) {
	const revenueChartData = useMemo(() => {
		return (stats.charts.revenueByDay ?? []).map((p) => ({
			date: p.date,
			dollars: Math.round((p.amountCents / 100) * 100) / 100,
		}));
	}, [stats.charts.revenueByDay]);

	const vipDonutData = useMemo(
		() => stats.charts.vipBreakdown.map((s) => ({ name: s.label, value: s.count })),
		[stats.charts.vipBreakdown],
	);

	const planDonutData = useMemo(
		() => stats.charts.planBreakdown.slice(0, 6).map((s) => ({ name: s.label, value: s.count })),
		[stats.charts.planBreakdown],
	);

	const DONUT_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#a78bfa", "#ef4444", "#22c55e"];

	const revenueDollarsAllTime =
		Math.round((stats.totals.revenueCentsAllTime / 100) * 100) / 100;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="text-sm font-medium text-white">Dashboard</p>
					<p className="text-sm text-gray-400">
						Trends for the last{" "}
						<span className="text-gray-200 font-semibold">{rangeDays}</span> days
					</p>
				</div>
				<AdminDashboardRangeSelector rangeDays={rangeDays} />
			</div>

			<div className="flex items-end justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs uppercase tracking-wide text-gray-500">Key metrics</p>
				</div>
				<div className="text-xs text-gray-500">
					All-time totals
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatTile label="Total users" value={stats.totals.users} />
				<StatTile label="Total quizzes" value={stats.totals.quizzes} />
				<StatTile label="Total documents" value={stats.totals.documents} />
				<StatTile
					label="All-time revenue (Stripe)"
					value={`$${revenueDollarsAllTime.toFixed(2)}`}
				/>
				<StatTile
					label="Active VIP subscriptions"
					value={stats.totals.activeSubscriptions}
				/>
			</div>

			<p className="text-xs uppercase tracking-wide text-gray-500">Trends</p>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 lg:col-span-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">
							Revenue by day (paid invoices, last {rangeDays}d)
						</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={revenueChartData} margin={{ left: 0, right: 0 }}>
								<CartesianGrid stroke="rgba(55, 65, 81, 0.35)" strokeDasharray="4 4" />
								<XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fill: "#9ca3af", fontSize: 12 }} />
								<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} allowDecimals />
								<Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
								<Bar dataKey="dollars" fill="#fbbf24" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
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

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
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

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
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

			<p className="text-xs uppercase tracking-wide text-gray-500">Breakdowns</p>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">VIP status</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip />
								<Pie
									data={vipDonutData}
									dataKey="value"
									nameKey="name"
									innerRadius={60}
									outerRadius={90}
									paddingAngle={2}
								>
									{vipDonutData.map((_, idx) => (
										<Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Plan breakdown</p>
					</div>
					<div className="mt-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip />
								<Pie
									data={planDonutData}
									dataKey="value"
									nameKey="name"
									innerRadius={60}
									outerRadius={90}
									paddingAngle={2}
								>
									{planDonutData.map((_, idx) => (
										<Cell key={idx} fill={DONUT_COLORS[(idx + 2) % DONUT_COLORS.length]} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Top played quizzes</p>
						<Link
							href="/admin/quizzes"
							className="text-xs text-gray-400 hover:text-white transition-colors"
						>
							View
						</Link>
					</div>
					<ol className="mt-3 divide-y divide-gray-800">
						{stats.charts.topQuizzes.length ? (
							stats.charts.topQuizzes.slice(0, 10).map((q, idx) => (
								<li key={q.quizId} className="py-2.5">
									<Link
										href={`/admin/quizzes/${q.quizId}`}
										className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-800/40 transition-colors"
										title={q.title}
									>
										<div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-200 tabular-nums shrink-0">
											{idx + 1}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-white truncate group-hover:text-emerald-100">
												{q.title}
											</p>
											<p className="text-xs text-gray-400">
												{q.sessions.toLocaleString()} sessions
											</p>
										</div>
										<div className="text-xs font-semibold text-gray-400 tabular-nums shrink-0">
											{q.sessions.toLocaleString()}
										</div>
									</Link>
								</li>
							))
						) : (
							<li className="py-8 text-center text-sm text-gray-400">No session data yet.</li>
						)}
					</ol>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Top saved quizzes</p>
						<Link
							href="/admin/quizzes?sort=saves_desc"
							className="text-xs text-gray-400 hover:text-white transition-colors"
						>
							View
						</Link>
					</div>
					<ol className="mt-3 divide-y divide-gray-800">
						{stats.charts.topSavedQuizzes.length ? (
							stats.charts.topSavedQuizzes.slice(0, 10).map((q, idx) => (
								<li key={q.quizId} className="py-2.5">
									<Link
										href={`/admin/quizzes/${q.quizId}`}
										className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-800/40 transition-colors"
										title={q.title}
									>
										<div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-200 tabular-nums shrink-0">
											{idx + 1}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-white truncate group-hover:text-indigo-100">
												{q.title}
											</p>
											<p className="text-xs text-gray-400">
												{q.saves.toLocaleString()} saves
											</p>
										</div>
										<div className="text-xs font-semibold text-gray-400 tabular-nums shrink-0">
											{q.saves.toLocaleString()}
										</div>
									</Link>
								</li>
							))
						) : (
							<li className="py-8 text-center text-sm text-gray-400">No saves yet.</li>
						)}
					</ol>
				</div>

				<div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-white">Top saved documents</p>
						<Link
							href="/admin/documents?sort=saves_desc"
							className="text-xs text-gray-400 hover:text-white transition-colors"
						>
							View
						</Link>
					</div>
					<ol className="mt-3 divide-y divide-gray-800">
						{stats.charts.topSavedDocuments.length ? (
							stats.charts.topSavedDocuments.slice(0, 10).map((d, idx) => (
								<li key={d.documentId} className="py-2.5">
									<Link
										href={`/admin/documents/${d.documentId}`}
										className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-800/40 transition-colors"
										title={d.fileName}
									>
										<div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-black text-amber-200 tabular-nums shrink-0">
											{idx + 1}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-white truncate">{d.fileName}</p>
											<p className="text-xs text-gray-400">
												{d.saves.toLocaleString()} saves
											</p>
										</div>
										<div className="text-xs font-semibold text-gray-400 tabular-nums shrink-0">
											{d.saves.toLocaleString()}
										</div>
									</Link>
								</li>
							))
						) : (
							<li className="py-8 text-center text-sm text-gray-400">No saves yet.</li>
						)}
					</ol>
				</div>
			</div>
		</div>
	);
}

