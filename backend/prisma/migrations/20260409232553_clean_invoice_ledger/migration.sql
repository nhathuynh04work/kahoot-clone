-- Create Invoice table first so we can backfill before dropping StripeInvoice.

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalUrl" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_externalId_key" ON "Invoice"("externalId");

-- CreateIndex
CREATE INDEX "Invoice_userId_occurredAt_idx" ON "Invoice"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "Invoice_occurredAt_idx" ON "Invoice"("occurredAt");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill from existing StripeInvoice rows.
INSERT INTO "Invoice" ("externalId", "externalUrl", "amountCents", "currency", "occurredAt", "createdAt", "userId")
SELECT
  s."stripeInvoiceId" AS "externalId",
  COALESCE(s."hostedInvoiceUrl", s."invoicePdfUrl") AS "externalUrl",
  COALESCE(s."amountPaidCents", s."totalCents", 0) AS "amountCents",
  COALESCE(s."currency", 'usd') AS "currency",
  COALESCE(s."occurredAt", s."paidAt", s."createdAt", CURRENT_TIMESTAMP) AS "occurredAt",
  COALESCE(s."createdAt", CURRENT_TIMESTAMP) AS "createdAt",
  s."userId" AS "userId"
FROM "StripeInvoice" s
ON CONFLICT ("externalId") DO NOTHING;

-- DropForeignKey
ALTER TABLE "StripeInvoice" DROP CONSTRAINT "StripeInvoice_userId_fkey";

-- DropTable
DROP TABLE "StripeInvoice";

