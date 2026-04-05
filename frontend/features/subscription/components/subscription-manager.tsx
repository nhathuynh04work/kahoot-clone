"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { User } from "@/features/auth/types";
import {
	openBillingPortal,
	startCheckoutSession,
	type PriceKey,
} from "../lib/billing-client";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export type BillingStatus = {
	stripeCustomerId: string | null;
	lifetimeVip: boolean;
	subscription: {
		status: string;
		stripePriceId: string;
		planKey: string | null;
		currentPeriodEnd: string;
		cancelAtPeriodEnd: boolean;
		isActive: boolean;
	} | null;
};

const PLANS: {
	key: PriceKey;
	name: string;
	description: string;
}[] = [
	{ key: "monthly", name: "Monthly", description: "Billed every month" },
	{ key: "quarterly", name: "Quarterly", description: "Billed every 3 months" },
	{ key: "yearly", name: "Yearly", description: "Billed once per year" },
	{ key: "lifetime", name: "Lifetime", description: "One-time payment, VIP forever" },
];

function planDisplayName(planKey: string | null | undefined): string {
	if (!planKey) return "VIP subscription";
	const map: Record<string, string> = {
		monthly: "Monthly",
		quarterly: "Quarterly",
		yearly: "Yearly",
		lifetime: "Lifetime",
	};
	return map[planKey] ?? "VIP subscription";
}

export function SubscriptionManager({
	user,
	initialBilling,
}: {
	user: User;
	initialBilling: BillingStatus | null;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const checkout = searchParams.get("checkout");
	const [loadingKey, setLoadingKey] = useState<PriceKey | "portal" | null>(
		null,
	);

	useEffect(() => {
		if (checkout === "success") {
			router.refresh();
		}
	}, [checkout, router]);

	const lifetimeMember =
		user.vip?.source === "lifetime" || initialBilling?.lifetimeVip === true;
	const recurringActive = initialBilling?.subscription?.isActive === true;
	const currentPlanKey = initialBilling?.subscription?.planKey as
		| PriceKey
		| null
		| undefined;
	const cancelScheduled =
		initialBilling?.subscription?.cancelAtPeriodEnd === true ||
		user.vip?.cancelAtPeriodEnd === true;
	const hasStripeCustomer = Boolean(initialBilling?.stripeCustomerId);

	const isVip =
		user.vip?.isVip ??
		(initialBilling?.lifetimeVip ||
			initialBilling?.subscription?.isActive ||
			false);

	const periodEndDate = (() => {
		if (user.vip?.source === "subscription" && user.vip.currentPeriodEnd) {
			return new Date(user.vip.currentPeriodEnd);
		}
		if (initialBilling?.subscription?.currentPeriodEnd) {
			return new Date(initialBilling.subscription.currentPeriodEnd);
		}
		return null;
	})();

	let statusLabel: string;
	let statusTone: "free" | "vip" | "lifetime" | "canceling";
	if (lifetimeMember) {
		statusLabel = "VIP · Lifetime";
		statusTone = "lifetime";
	} else if (recurringActive && cancelScheduled) {
		statusLabel = "VIP · Canceling";
		statusTone = "canceling";
	} else if (isVip) {
		statusLabel = "VIP · Active";
		statusTone = "vip";
	} else {
		statusLabel = "Free";
		statusTone = "free";
	}

	const statusBadgeClass =
		statusTone === "free"
			? "bg-gray-800/80 text-gray-300"
			: statusTone === "lifetime"
				? "bg-amber-500/15 text-amber-200"
				: statusTone === "canceling"
					? "bg-amber-500/10 text-amber-100"
					: "bg-emerald-500/15 text-emerald-200";

	async function onCheckout(key: PriceKey) {
		setLoadingKey(key);
		try {
			await startCheckoutSession(key);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Checkout failed");
		} finally {
			setLoadingKey(null);
		}
	}

	async function onPortal() {
		setLoadingKey("portal");
		try {
			await openBillingPortal();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not open portal");
		} finally {
			setLoadingKey(null);
		}
	}

	const showPlanGrid = !lifetimeMember;
	const showLimitsAndPlansCard = Boolean(user.limits) || showPlanGrid;

	const cardClass =
		"rounded-xl border border-gray-700 bg-gray-800/40 p-5 sm:p-6 space-y-6";

	return (
		<div className="space-y-6 pb-2">
			<div className={cardClass}>
				{checkout === "success" ? (
					<div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
						Thanks! Your payment is processing. This page will refresh shortly
						after your bank confirms.
					</div>
				) : null}
				{checkout === "canceled" ? (
					<div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
						Checkout was canceled. You can pick a plan below whenever you are
						ready.
					</div>
				) : null}

				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<p className="text-sm text-gray-500">{user.email}</p>
					</div>
					<span
						className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
					>
						{statusLabel}
					</span>
				</div>

				{(isVip && !lifetimeMember) || recurringActive ? (
					<div className="space-y-2 border-t border-gray-800 pt-6">
						<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							Current plan
						</h2>
						<p className="text-lg font-semibold text-white">
							{lifetimeMember
								? "Lifetime VIP"
								: planDisplayName(currentPlanKey ?? null)}
						</p>
						{periodEndDate &&
						(recurringActive || user.vip?.source === "subscription") ? (
							<p className="text-sm text-gray-400">
								{cancelScheduled
									? `Access until ${periodEndDate.toLocaleDateString()}`
									: `Renews ${periodEndDate.toLocaleDateString()}`}
							</p>
						) : null}
						{cancelScheduled && recurringActive ? (
							<p className="text-sm text-amber-200/90">
								Subscription ends on the date above; you keep VIP until then.
							</p>
						) : null}
					</div>
				) : null}

				{lifetimeMember ? (
					<p className="text-sm text-gray-400 border-t border-gray-800 pt-6">
						<span className="text-amber-200/95 font-medium">Lifetime VIP.</span>{" "}
						No renewals — benefits stay on this account.
					</p>
				) : null}

				{hasStripeCustomer ? (
					<div className="space-y-2 border-t border-gray-800 pt-6">
						<button
							type="button"
							onClick={() => onPortal()}
							disabled={loadingKey !== null}
							className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-gray-950 px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
						>
							{loadingKey === "portal" ? (
								<Loader2 className="animate-spin w-4 h-4" />
							) : (
								<CreditCard className="w-4 h-4" aria-hidden />
							)}
							Manage billing in Stripe
						</button>
						<p className="text-xs text-gray-500 max-w-md">
							Card, invoices, and cancellation live in Stripe&apos;s secure portal.
						</p>
					</div>
				) : null}
			</div>

			{showLimitsAndPlansCard ? (
				<div className={cardClass}>
					{user.limits ? (
						<div className="space-y-3">
							<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
								Your limits
							</h2>
							<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
								<div className="flex justify-between gap-4 border-b border-gray-800/80 py-2 sm:border-0 sm:block sm:py-0">
									<dt className="text-gray-500">Questions per quiz</dt>
									<dd className="text-gray-200 font-medium tabular-nums">
										{user.limits.maxQuestionsPerQuiz}
									</dd>
								</div>
								<div className="flex justify-between gap-4 border-b border-gray-800/80 py-2 sm:border-0 sm:block sm:py-0">
									<dt className="text-gray-500">Documents</dt>
									<dd className="text-gray-200 font-medium tabular-nums">
										{user.limits.maxDocuments}
									</dd>
								</div>
								<div className="flex justify-between gap-4 border-b border-gray-800/80 py-2 sm:border-0 sm:block sm:py-0">
									<dt className="text-gray-500">File storage</dt>
									<dd className="text-gray-200 font-medium tabular-nums">
										{Math.round(user.limits.maxTotalStorageBytes / (1024 * 1024))}{" "}
										MB
									</dd>
								</div>
								<div className="flex justify-between gap-4 py-2 sm:block sm:py-0 sm:pt-0">
									<dt className="text-gray-500">Short answer &amp; range</dt>
									<dd className="text-gray-200 font-medium">
										{user.limits.canUseShortAnswerAndRange ? "On" : "VIP only"}
									</dd>
								</div>
							</dl>
						</div>
					) : null}

					{showPlanGrid ? (
						<div
							className={
								user.limits ? "space-y-4 border-t border-gray-800 pt-6" : "space-y-4"
							}
						>
							<h2 className="text-sm font-semibold text-white">
								{recurringActive ? "Change plan" : "Plans"}
							</h2>
							{recurringActive ? (
								<p className="text-sm text-gray-500">
									Checkout may start a new subscription depending on your Stripe
									setup. Use billing portal to cancel or update your card.
								</p>
							) : (
								<p className="text-sm text-gray-500">
									Cancel recurring plans anytime from the billing portal after you
									subscribe.
								</p>
							)}
							<ul className="divide-y divide-gray-800 border-t border-b border-gray-800">
								{PLANS.map((p) => {
									const isCurrent =
										recurringActive &&
										currentPlanKey === p.key &&
										p.key !== "lifetime";
									const isLifetimePlan = p.key === "lifetime";
									return (
										<li
											key={p.key}
											className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<p className="font-medium text-white">{p.name}</p>
													{isCurrent ? (
														<span className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
															Current
														</span>
													) : null}
												</div>
												<p className="text-xs text-gray-500 mt-0.5">
													{p.description}
												</p>
											</div>
											{isCurrent ? (
												<p className="text-xs text-gray-500 sm:text-right sm:max-w-xs">
													Use billing portal for payment method or cancel.
												</p>
											) : (
												<button
													type="button"
													onClick={() => onCheckout(p.key)}
													disabled={loadingKey !== null}
													className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2 sm:min-w-36"
												>
													{loadingKey === p.key ? (
														<Loader2 className="animate-spin w-4 h-4" />
													) : null}
													{isLifetimePlan
														? "Buy lifetime"
														: recurringActive
															? "Switch"
															: "Subscribe"}
												</button>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
