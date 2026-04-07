"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { User } from "@/features/auth/types";
import {
	openBillingPortal,
	startCheckoutSession,
	type PriceKey,
} from "../lib/billing-client";
import { VIP_PLANS } from "../lib/plan-display";
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

function formatBytesAsMb(bytes: number): string {
	return `${Math.round(bytes / (1024 * 1024))} MB`;
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
	const showLimitsAndPlansCard = showPlanGrid;

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

				{(isVip && !lifetimeMember) || recurringActive ? (
					<div className="space-y-2 border-t border-gray-800 pt-6">
						<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							Current plan
						</h2>
						<p className="text-xl font-semibold text-white">
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
					{showPlanGrid ? (
						<div
							className={
								"space-y-8"
							}
						>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<h2 className="text-lg font-semibold text-white">
										{recurringActive ? "Change billing option" : "Choose a plan"}
									</h2>
									<p className="text-sm text-gray-500 mt-1 max-w-2xl">
										{recurringActive
											? "For cancellations, invoices, or card updates, use the Stripe billing portal."
											: "Pick a billing option. You can cancel recurring plans anytime from the Stripe billing portal after you subscribe."}
									</p>
								</div>
							</div>

							<div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-5">
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
									<div className="min-w-0">
										<p className="text-sm font-semibold text-white">VIP includes</p>
										<ul className="mt-3 space-y-3 text-sm text-gray-300">
											<li className="flex items-start gap-3">
												<CheckCircle2
													className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0"
													aria-hidden
												/>
												<span>
													<span className="font-semibold text-white">
														Up to 200 questions
													</span>{" "}
													per quiz
												</span>
											</li>
											<li className="flex items-start gap-3">
												<ListChecks
													className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0"
													aria-hidden
												/>
												<span>
													<span className="font-semibold text-white">
														Advanced question types
													</span>{" "}
													(short answer + number input)
												</span>
											</li>
											<li className="flex items-start gap-3">
												<FileText
													className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0"
													aria-hidden
												/>
												<span>
													<span className="font-semibold text-white">
														100 documents
													</span>{" "}
													and{" "}
													<span className="font-semibold text-white">500 MB</span>{" "}
													total storage
												</span>
											</li>
											<li className="flex items-start gap-3">
												<Sparkles
													className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0"
													aria-hidden
												/>
												<span>
													<span className="font-semibold text-white">
														VIP AI generation
													</span>{" "}
													can include advanced formats
												</span>
											</li>
										</ul>
									</div>

									<div className="hidden lg:flex items-center justify-center shrink-0">
										<div className="relative w-32 h-32 rounded-2xl border border-gray-800 bg-gray-950/20 flex items-center justify-center">
											<Crown
												className="w-16 h-16 text-indigo-300/90"
												aria-hidden
											/>
											<div className="absolute inset-0 rounded-2xl shadow-[0_0_0_1px_rgba(99,102,241,0.10)]" />
										</div>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{VIP_PLANS.map((p) => {
									const isCurrent =
										recurringActive &&
										currentPlanKey === p.key &&
										p.key !== "lifetime";
									const isLifetimePlan = p.key === "lifetime";
									const isRecommended = p.badge === "Most popular";

									const badge =
										isCurrent ? "Current" : p.badge ? p.badge : null;

									const badgeClass = isCurrent
										? "bg-indigo-500/15 text-indigo-200 border-indigo-500/25"
										: isRecommended
											? "bg-amber-500/15 text-amber-200 border-amber-500/25"
											: "bg-gray-800/60 text-gray-300 border-gray-700";

									const cardOuterClass = isRecommended
										? "rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 shadow-[0_0_0_1px_rgba(245,158,11,0.10)]"
										: "rounded-2xl border border-gray-800 bg-gray-950/30 p-5";

									const ctaLabel = isCurrent
										? "Current plan"
										: isLifetimePlan
											? "Buy lifetime"
											: recurringActive
												? "Switch"
												: "Subscribe";

									const ctaClass = isCurrent
										? "bg-gray-800 text-gray-400 cursor-default"
										: isRecommended
											? "bg-amber-500 hover:bg-amber-400 text-gray-950"
											: "bg-indigo-600 hover:bg-indigo-500 text-white";

									return (
										<div key={p.key} className={`${cardOuterClass} h-full`}>
											<div className="flex flex-col h-full">
												<div className="flex items-start justify-between gap-3 min-h-[64px]">
													<div className="min-w-0">
													<p className="text-sm font-semibold text-white">
														{p.name}
													</p>
													<p className="text-xs text-gray-500 mt-1 leading-snug">
														{p.description}
													</p>
													</div>
													{badge ? (
														<span
															className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
														>
															{badge}
														</span>
													) : null}
												</div>

												<div className="mt-4 min-h-[64px]">
													<p className="text-3xl font-black tracking-tight text-white tabular-nums">
														{p.priceLabel}
														<span className="text-sm font-semibold text-gray-400 ml-2">
															{p.priceSubLabel}
														</span>
													</p>
													{p.monthlyEquivalent ? (
														<p className="text-xs text-gray-500 mt-1">
															{p.monthlyEquivalent}
														</p>
													) : null}
												</div>

												<div className="mt-auto pt-5">
													<button
														type="button"
														onClick={() => (isCurrent ? null : onCheckout(p.key))}
														disabled={loadingKey !== null || isCurrent}
														className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2 ${ctaClass}`}
													>
														{loadingKey === p.key ? (
															<Loader2 className="animate-spin w-4 h-4" />
														) : null}
														{ctaLabel}
													</button>

													{isCurrent && hasStripeCustomer ? (
														<p className="text-[11px] text-gray-500 mt-3 min-h-[32px]">
															Manage cancellations and payment details in the billing portal above.
														</p>
													) : (
														<p className="text-[11px] text-gray-500 mt-3 min-h-[32px]">
															{isLifetimePlan
																? "One-time purchase. VIP stays on this account."
																: "Recurring plans can be canceled from the billing portal."}
														</p>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
