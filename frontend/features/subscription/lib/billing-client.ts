"use client";

import { apiClient } from "@/lib/apiClient";

export async function startCheckoutSession() {
	const { data } = await apiClient.post<{ url: string }>(
		"/billing/checkout-session",
	);
	if (data?.url) window.location.href = data.url;
}

export async function openBillingPortal() {
	const { data } = await apiClient.post<{ url: string }>(
		"/billing/portal-session",
	);
	if (data?.url) window.location.href = data.url;
}
