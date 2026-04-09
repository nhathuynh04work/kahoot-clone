-- Drop unused Stripe mirror fields (minimal schema)
--
-- These columns were written from Stripe webhooks but not read by
-- backend logic or frontend UI in this codebase.
ALTER TABLE "Subscription"
    DROP COLUMN "currentPeriodStart",
    DROP COLUMN "cancelAt",
    DROP COLUMN "canceledAt",
    DROP COLUMN "trialEnd";

-- Redundant with `subscriptionId` relation for our current needs.
ALTER TABLE "StripeInvoice"
    DROP COLUMN "stripeSubscriptionId";

