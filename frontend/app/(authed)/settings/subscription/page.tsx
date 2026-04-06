import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { apiServer } from "@/lib/apiServer";
import { SubscriptionManager } from "@/features/subscription/components/subscription-manager";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Billing & VIP",
	description: "Manage your Quiztopia VIP subscription, billing, and plan limits.",
};

export default async function SubscriptionPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/auth/login?returnTo=/settings/subscription");

	let initialBilling = null;
	try {
		const api = await apiServer();
		const { data } = await api.get("/billing/status");
		initialBilling = data;
	} catch {
		initialBilling = null;
	}

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<SubscriptionManager user={user} initialBilling={initialBilling} />
			</div>
		</div>
	);
}
