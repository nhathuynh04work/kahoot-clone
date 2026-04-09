-- Drop StripeInvoice -> Subscription relation.
--
-- Subscription info is derived from User -> Subscription, so invoices only
-- need to be associated to a user for history/ledger.
ALTER TABLE "StripeInvoice" DROP CONSTRAINT IF EXISTS "StripeInvoice_subscriptionId_fkey";

DROP INDEX IF EXISTS "StripeInvoice_subscriptionId_idx";

ALTER TABLE "StripeInvoice" DROP COLUMN IF EXISTS "subscriptionId";

