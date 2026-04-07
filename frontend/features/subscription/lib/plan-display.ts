import type { PriceKey } from "./billing-client";

export type PlanDisplay = {
	key: PriceKey;
	name: string;
	description: string;
	priceLabel: string;
	priceSubLabel?: string;
	monthlyEquivalent?: string;
	badge?: "Most popular" | "Best long-term";
};

/**
 * Display-only pricing. Checkout uses Stripe Price IDs server-side.
 * Keep these in sync with Stripe products to avoid confusing users.
 */
export const VIP_PLANS: PlanDisplay[] = [
	{
		key: "monthly",
		name: "Monthly",
		description: "Flexible monthly billing",
		priceLabel: "$5",
		priceSubLabel: "per month",
		monthlyEquivalent: "$5/mo",
	},
	{
		key: "quarterly",
		name: "Quarterly",
		description: "Save with a quarter",
		priceLabel: "$10",
		priceSubLabel: "every 3 months",
		monthlyEquivalent: "$3.33/mo",
	},
	{
		key: "yearly",
		name: "Yearly",
		description: "Best value for regular hosts",
		priceLabel: "$30",
		priceSubLabel: "per year",
		monthlyEquivalent: "$2.50/mo",
		badge: "Most popular",
	},
	{
		key: "lifetime",
		name: "Lifetime",
		description: "Pay once, VIP forever",
		priceLabel: "$50",
		priceSubLabel: "one-time",
		monthlyEquivalent: "Pay once",
		badge: "Best long-term",
	},
];

