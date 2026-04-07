"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { User } from "@/features/auth/types";
import {
	openBillingPortal,
	startCheckoutSession,
} from "../lib/billing-client";
import { toast } from "sonner";
import {
	CheckCircle2,
	FileText,
	Loader2,
	Sparkles,
	ListChecks,
	Crown,
	CreditCard,
} from "lucide-react";

export type BillingStatus = {
	stripeCustomerId: string | null;
	subscription: {
		status: string;
		currentPeriodEnd: string;
		cancelAtPeriodEnd: boolean;
		isActive: boolean;
	} | null;
};

export type BillingHistory = {
	invoices: Array<{
		stripeInvoiceId: string;
		status: string | null;
		totalCents: number | null;
		amountPaidCents: number | null;
		currency: string;
		hostedInvoiceUrl: string | null;
		invoicePdfUrl: string | null;
		paidAt: string | null;
		occurredAt: string | null;
	}>;
};

export function SubscriptionManager({
	user,
	initialBilling,
	initialHistory,
}: {
	user: User;
	initialBilling: BillingStatus | null;
	initialHistory: BillingHistory | null;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const checkout = searchParams.get("checkout");
	const [loadingKey, setLoadingKey] = useState<"checkout" | "portal" | null>(null);

	useEffect(() => {
		if (checkout === "success") {
			router.refresh();
		}
	}, [checkout, router]);

	const recurringActive = initialBilling?.subscription?.isActive === true;
	const cancelScheduled =
		initialBilling?.subscription?.cancelAtPeriodEnd === true ||
		user.vip?.cancelAtPeriodEnd === true;
	const hasStripeCustomer = Boolean(initialBilling?.stripeCustomerId);

	const isVip =
		user.vip?.isVip ??
		(initialBilling?.subscription?.isActive || false);

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
	let statusTone: "free" | "vip" | "canceling";
	if (recurringActive && cancelScheduled) {
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
			: statusTone === "canceling"
				? "bg-amber-500/10 text-amber-100"
				: "bg-emerald-500/15 text-emerald-200";

	async function onCheckout() {
		setLoadingKey("checkout");
		try {
			await startCheckoutSession();
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

	const showPlanGrid = true;
	const showLimitsAndPlansCard = showPlanGrid;

	const cardClass =
		"rounded-xl border border-gray-700 bg-gray-800/40 p-5 sm:p-6 space-y-6";

	const invoices = initialHistory?.invoices ?? [];

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
						<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							Subscription
						</p>
						<p className="text-sm text-gray-500">{user.email}</p>
					</div>
					<span
						className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
					>
						{statusLabel}
					</span>
				</div>

				{isVip || recurringActive ? (
					<div className="space-y-2 border-t border-gray-800 pt-6">
						<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							Current plan
						</h2>
						<p className="text-xl font-semibold text-white">
							VIP subscription
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
					{showPlanGrid ? (
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold text-white">Plans</h2>
								<p className="text-sm text-gray-500 mt-1 max-w-2xl">
									Compare Free vs VIP. VIP is a subscription you can cancel anytime
									from the Stripe billing portal.
								</p>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-5">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-white">Free</p>
											<p className="text-xs text-gray-500 mt-1">
												Everything you need to start hosting.
											</p>
										</div>
										<span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-300">
											{!isVip && !recurringActive ? "Current" : "Included"}
										</span>
									</div>

									<ul className="mt-4 space-y-3 text-sm text-gray-300">
										<li className="flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">Up to 20 questions</span> per quiz
											</span>
										</li>
										<li className="flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">Basic question types</span>{" "}
												(multiple choice + true/false)
											</span>
										</li>
										<li className="flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">10 documents</span> and{" "}
												<span className="font-semibold text-white">50 MB</span> total storage
											</span>
										</li>
									</ul>
								</div>

								<div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.10)]">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-white inline-flex items-center gap-2">
												VIP
												<span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
													Subscription
												</span>
											</p>
											<p className="text-xs text-gray-500 mt-1">
												More content, advanced questions, and bigger limits.
											</p>
										</div>
										<div className="hidden sm:flex items-center justify-center shrink-0">
											<div className="relative w-12 h-12 rounded-xl border border-gray-800 bg-gray-950/20 flex items-center justify-center">
												<Crown className="w-6 h-6 text-indigo-300/90" aria-hidden />
											</div>
										</div>
									</div>

									<div className="mt-4">
										<p className="text-3xl font-black tracking-tight text-white tabular-nums">
											$10
											<span className="text-sm font-semibold text-gray-400 ml-2">every 3 months</span>
										</p>
										<p className="text-xs text-gray-500 mt-1">$3.33/mo</p>
									</div>

									<ul className="mt-4 space-y-3 text-sm text-gray-300">
										<li className="flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">Up to 200 questions</span> per quiz
											</span>
										</li>
										<li className="flex items-start gap-3">
											<ListChecks className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">Advanced question types</span>{" "}
												(short answer + number input)
											</span>
										</li>
										<li className="flex items-start gap-3">
											<FileText className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">100 documents</span> and{" "}
												<span className="font-semibold text-white">500 MB</span> total storage
											</span>
										</li>
										<li className="flex items-start gap-3">
											<Sparkles className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
											<span>
												<span className="font-semibold text-white">VIP AI generation</span> can include advanced formats
											</span>
										</li>
									</ul>

									<div className="mt-6">
										<button
											type="button"
											onClick={() => (isVip || recurringActive ? null : onCheckout())}
											disabled={loadingKey !== null || isVip || recurringActive}
											className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2 ${
												isVip || recurringActive
													? "bg-gray-800 text-gray-400 cursor-default"
													: "bg-amber-500 hover:bg-amber-400 text-gray-950"
											}`}
										>
											{loadingKey === "checkout" ? (
												<Loader2 className="animate-spin w-4 h-4" />
											) : null}
											{isVip || recurringActive ? "You’re VIP" : "Subscribe"}
										</button>
										<p className="text-[11px] text-gray-500 mt-3 min-h-[32px]">
											{hasStripeCustomer
												? "After subscribing, manage invoices and cancellation in the Stripe portal above."
												: "After subscribing, you can manage billing in Stripe."}
										</p>
									</div>
								</div>
							</div>
						</div>
					) : null}
				</div>
			) : null}

			{invoices.length > 0 ? (
				<div className={cardClass}>
					<div className="flex items-end justify-between gap-4">
						<div>
							<h2 className="text-lg font-semibold text-white">Payment history</h2>
							<p className="text-sm text-gray-500 mt-1">
								Recent invoice payments.
							</p>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-xs uppercase tracking-wide text-gray-500">
									<th className="py-2 pr-4">Date</th>
									<th className="py-2 pr-4">Amount</th>
									<th className="py-2 pr-4">Status</th>
									<th className="py-2 pr-4">Receipt</th>
								</tr>
							</thead>
							<tbody className="text-gray-200">
								{/* Invoices */}
								{invoices.slice(0, 10).map((i) => {
									const when = i.paidAt ?? i.occurredAt;
									const date = when ? new Date(when) : null;
									const amount = i.amountPaidCents ?? i.totalCents;
									return (
										<tr key={`inv:${i.stripeInvoiceId}`} className="border-t border-gray-800">
											<td className="py-3 pr-4 whitespace-nowrap">
												{date ? date.toLocaleDateString() : "—"}
											</td>
											<td className="py-3 pr-4 whitespace-nowrap tabular-nums">
												{amount != null ? `$${(amount / 100).toFixed(2)}` : "—"}
											</td>
											<td className="py-3 pr-4 whitespace-nowrap">
												{i.status ?? "—"}
											</td>
											<td className="py-3 pr-4 whitespace-nowrap">
												{i.hostedInvoiceUrl ? (
													<a
														href={i.hostedInvoiceUrl}
														target="_blank"
														rel="noreferrer"
														className="text-indigo-300 hover:text-indigo-200 font-semibold"
													>
														View
													</a>
												) : i.invoicePdfUrl ? (
													<a
														href={i.invoicePdfUrl}
														target="_blank"
														rel="noreferrer"
														className="text-indigo-300 hover:text-indigo-200 font-semibold"
													>
														PDF
													</a>
												) : (
													"—"
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			) : null}
		</div>
	);
}
