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
		topQuizzes: Array<{ quizId: number; title: string; sessions: number }>;
		topSavedQuizzes: Array<{ quizId: number; title: string; saves: number }>;
		topSavedDocuments: Array<{ documentId: number; fileName: string; saves: number }>;
		vipBreakdown: Array<{ label: string; count: number }>;
		planBreakdown: Array<{ label: string; count: number }>;
		revenueByDay: Array<{ date: string; amountCents: number }>;
	};
};

export async function getAdminDashboardStats(options?: { rangeDays?: number }) {
	const api = await apiServer();

	const params = new URLSearchParams();
	if (options?.rangeDays) params.set("rangeDays", String(options.rangeDays));

	const { data } = await api.get(
		`/admin/stats${params.toString() ? `?${params.toString()}` : ""}`,
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

	const { data } = await api.get(`/admin/users?${params.toString()}`);
	return data as AdminUserListResponse;
}

export type AdminQuizListItem = {
	id: number;
	title: string;
	visibility: "PUBLIC" | "PRIVATE";
	createdAt: string;
	authorEmail: string;
	savesCount: number;
};

export type AdminQuizListResponse = {
	items: AdminQuizListItem[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function getAdminQuizzesPage(options: {
	page: number;
	pageSize: number;
	q?: string;
	sort?: "createdAt_desc" | "createdAt_asc" | "saves_desc";
}): Promise<AdminQuizListResponse> {
	const api = await apiServer();

	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.sort) params.set("sort", options.sort);

	const { data } = await api.get(`/admin/quizzes?${params.toString()}`);
	return data as AdminQuizListResponse;
}

export type AdminDocumentListItem = {
	id: number;
	fileName: string;
	status: "UPLOADED" | "PARSING" | "READY" | "ERROR";
	visibility: "PUBLIC" | "PRIVATE";
	fileSize: number;
	createdAt: string;
	authorEmail: string;
	savesCount: number;
};

export type AdminDocumentListResponse = {
	items: AdminDocumentListItem[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function getAdminDocumentsPage(options: {
	page: number;
	pageSize: number;
	q?: string;
	status?: "UPLOADED" | "PARSING" | "READY" | "ERROR";
	sort?: "createdAt_desc" | "createdAt_asc" | "saves_desc";
}): Promise<AdminDocumentListResponse> {
	const api = await apiServer();

	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.status) params.set("status", options.status);
	if (options.sort) params.set("sort", options.sort);

	const { data } = await api.get(
		`/admin/documents?${params.toString()}`,
	);
	return data as AdminDocumentListResponse;
}

export type AdminSessionListItem = {
	id: number;
	pin: string;
	status: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
	createdAt: string;
	endedAt: string | null;
	quizId: number;
	quizTitle: string;
	hostEmail: string;
	totalPlayers: number | null;
};

export type AdminSessionListResponse = {
	items: AdminSessionListItem[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function getAdminSessionsPage(options: {
	page: number;
	pageSize: number;
	q?: string;
	status?: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
	sort?: "createdAt_desc" | "createdAt_asc" | "endedAt_desc";
}): Promise<AdminSessionListResponse> {
	const api = await apiServer();

	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.status) params.set("status", options.status);
	if (options.sort) params.set("sort", options.sort);

	const { data } = await api.get(`/admin/sessions?${params.toString()}`);
	return data as AdminSessionListResponse;
}

export type AdminRevenueLedgerItem = {
	id: number;
	stripeInvoiceId: string;
	amountCents: number;
	currency: string;
	occurredAt: string;
	userEmail: string | null;
};

export type AdminRevenueSubscriptionItem = {
	id: number;
	userEmail: string;
	status: string;
	stripePriceId: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	createdAt: string;
	updatedAt: string;
};

export type AdminRevenuePageResponse = {
	ledger: {
		items: AdminRevenueLedgerItem[];
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
	recentSubscriptions: AdminRevenueSubscriptionItem[];
};

export async function getAdminRevenuePage(options: {
	page: number;
	pageSize: number;
	q?: string;
}): Promise<AdminRevenuePageResponse> {
	const api = await apiServer();

	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());

	const { data } = await api.get(`/admin/revenue?${params.toString()}`);
	return data as AdminRevenuePageResponse;
}

export type AdminUserDetailResponse = {
	id: number;
	email: string;
	name: string | null;
	role: "USER" | "ADMIN";
	isBlocked: boolean;
	createdAt: string;
	lifetimeVip: boolean;
	stripeCustomerId: string | null;
	subscription: null | {
		status: string;
		stripePriceId: string;
		currentPeriodEnd: string;
		cancelAtPeriodEnd: boolean;
		updatedAt: string;
	};
	_count: {
		quizzes: number;
		documents: number;
		quizSaves: number;
		documentSaves: number;
		lobbies: number;
	};
};

export async function getAdminUserDetail(userId: number) {
	const api = await apiServer();
	const { data } = await api.get(`/admin/users/${userId}`);
	return data as AdminUserDetailResponse;
}

export type AdminQuizDetailResponse = {
	id: number;
	title: string;
	description: string | null;
	coverUrl: string | null;
	visibility: "PUBLIC" | "PRIVATE";
	createdAt: string;
	author: { id: number; email: string };
	counts: { questions: number; saves: number; sessions: number };
	recentSessions: Array<{
		id: number;
		pin: string;
		status: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
		createdAt: string;
		endedAt: string | null;
		hostEmail: string;
		totalPlayers: number | null;
	}>;
};

export async function getAdminQuizDetail(quizId: number) {
	const api = await apiServer();
	const { data } = await api.get(`/admin/quizzes/${quizId}`);
	return data as AdminQuizDetailResponse;
}

export type AdminDocumentDetailResponse = {
	id: number;
	fileName: string;
	fileUrl: string;
	fileSize: number;
	mimeType: string;
	cloudinaryPublicId: string | null;
	status: "UPLOADED" | "PARSING" | "READY" | "ERROR";
	visibility: "PUBLIC" | "PRIVATE";
	createdAt: string;
	author: { id: number; email: string };
	counts: { chunks: number; saves: number };
};

export async function getAdminDocumentDetail(documentId: number) {
	const api = await apiServer();
	const { data } = await api.get(`/admin/documents/${documentId}`);
	return data as AdminDocumentDetailResponse;
}

export type AdminSessionDetailResponse = {
	id: number;
	pin: string;
	status: "CREATED" | "WAITING" | "IN_PROGRESS" | "CLOSED";
	createdAt: string;
	endedAt: string | null;
	quiz: { id: number; title: string };
	host: { id: number; email: string };
	report: null | {
		totalPlayers: number;
		totalQuestions: number;
		totalAnswers: number;
		totalCorrect: number;
		totalIncorrect: number;
		avgAccuracy: number;
		createdAt: string;
	};
};

export async function getAdminSessionDetail(sessionId: number) {
	const api = await apiServer();
	const { data } = await api.get(`/admin/sessions/${sessionId}`);
	return data as AdminSessionDetailResponse;
}

