"use client";

import { apiClient } from "@/lib/apiClient";

export type PriceKey = "monthly" | "quarterly" | "yearly" | "lifetime";

export async function startCheckoutSession(priceKey: PriceKey) {
	const { data } = await apiClient.post<{ url: string }>(
		"/billing/checkout-session",
		{ priceKey },
	);
	if (data?.url) window.location.href = data.url;
}

export async function openBillingPortal() {
	const { data } = await apiClient.post<{ url: string }>(
		"/billing/portal-session",
	);
	if (data?.url) window.location.href = data.url;
}
