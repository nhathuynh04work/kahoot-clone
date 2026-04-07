-- Drop stored Stripe price identifiers (single-plan system)
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripePriceId";
ALTER TABLE "RevenueLedgerEntry" DROP COLUMN IF EXISTS "stripePriceId";

