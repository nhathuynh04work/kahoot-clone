"use server";

import { apiServer } from "@/lib/apiServer";

export type AdminDashboardStatsResponse = {
	totals: {
		users: number;
		quizzes: number;
		documents: number;
		revenueCentsAllTime: number;
		activeSubscriptions: number;
	};
	charts: {
		userGrowth: Array<{ date: string; count: number }>;
		quizGrowth: Array<{ date: string; count: number }>;
		sessionsPlayed: Array<{ date: string; count: number }>;
		activeSessions: Array<{ status: string; count: number }>;
		avgAccuracyOverTime: Array<{ date: string; avgAccuracy: number }>;
		topQuizzes: Array<{ quizId: number; title: string; sessions: number }>;
		documentStatusBreakdown: Array<{ status: string; count: number }>;
		revenueByDay: Array<{ date: string; amountCents: number }>;
	};
};

export async function getAdminDashboardStats(options?: { rangeDays?: number }) {
	const api = await apiServer();

	const params = new URLSearchParams();
	if (options?.rangeDays) params.set("rangeDays", String(options.rangeDays));

	const { data } = await api.get(
		`/admin/dashboard/stats${params.toString() ? `?${params.toString()}` : ""}`,
	);

	return data as AdminDashboardStatsResponse;
}

export type AdminUserListItem = {
	id: number;
	email: string;
	name: string | null;
	role: "USER" | "ADMIN";
	isBlocked: boolean;
	createdAt: string;
};

export type AdminUserListResponse = {
	items: AdminUserListItem[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function getAdminUsersPage(options: {
	page: number;
	pageSize: number;
	q?: string;
	sort?: "createdAt_desc" | "createdAt_asc";
}): Promise<AdminUserListResponse> {
	const api = await apiServer();

	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.sort) params.set("sort", options.sort);

	const { data } = await api.get(`/admin/dashboard/users?${params.toString()}`);
	return data as AdminUserListResponse;
}

