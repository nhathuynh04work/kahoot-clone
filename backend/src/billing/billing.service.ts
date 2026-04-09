import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service.js";
import { SubscriptionStatus } from "../generated/prisma/client.js";

const STRIPE_PRICE_ENV_PRIMARY = "STRIPE_PRICE_VIP";
const STRIPE_PRICE_ENV_FALLBACK = "STRIPE_PRICE_QUARTERLY";

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private readonly stripe: Stripe | null;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const secret = this.config.get<string>("STRIPE_SECRET_KEY");
        this.stripe = secret ? new Stripe(secret) : null;
    }

    private requireStripe(): Stripe {
        if (!this.stripe) {
            throw new ServiceUnavailableException("Stripe is not configured");
        }
        return this.stripe;
    }

    getVipPriceId(): string {
        const primary = this.config.get<string>(STRIPE_PRICE_ENV_PRIMARY)?.trim();
        if (primary) return primary;
        const fallback = this.config.get<string>(STRIPE_PRICE_ENV_FALLBACK)?.trim();
        if (fallback) return fallback;
        throw new BadRequestException(
            `Missing env ${STRIPE_PRICE_ENV_PRIMARY}. Add your Stripe Price ID for the VIP plan.`,
        );
    }

    private mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
        return status as unknown as SubscriptionStatus;
    }

    async syncSubscriptionFromStripeForUser(userId: number): Promise<void> {
        if (!this.stripe) return;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                stripeCustomerId: true,
                subscription: { select: { stripeSubscriptionId: true } } as any,
            } as any,
        });
        if (!user?.stripeCustomerId) return;

        const stripe = this.requireStripe();

        try {
            let sub: Stripe.Subscription | null = null;
            const existingSubId = (user as any).subscription?.stripeSubscriptionId as string | undefined;

            if (existingSubId) {
                sub = await stripe.subscriptions.retrieve(existingSubId);
            } else {
                // Pick the most recently created subscription (any status).
                const customerId = user.stripeCustomerId;
                if (typeof customerId !== "string" || !customerId) return;
                const list = await stripe.subscriptions.list({
                    customer: customerId,
                    status: "all",
                    limit: 1,
                });
                sub = list.data?.[0] ?? null;
            }

            if (!sub) return;
            await this.upsertSubscriptionRow(userId, sub);
        } catch (e) {
            this.logger.warn(`Stripe sync failed for user ${userId}: ${String(e)}`);
        }
    }

    async createCheckoutSession(userId: number, email: string) {
        const stripe = this.requireStripe();
        const frontendUrl = this.config.get<string>("FRONTEND_URL")?.replace(/\/$/, "") || "";
        if (!frontendUrl) {
            throw new InternalServerErrorException("FRONTEND_URL is not set");
        }

        const priceId = this.getVipPriceId();
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException("User not found");

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${frontendUrl}/settings/subscription?checkout=success`,
            cancel_url: `${frontendUrl}/settings/subscription?checkout=canceled`,
            client_reference_id: String(userId),
            metadata: { userId: String(userId) },
        };

        if (user.stripeCustomerId) {
            sessionParams.customer = user.stripeCustomerId;
        } else {
            sessionParams.customer_email = email;
        }

        sessionParams.subscription_data = {
            metadata: { userId: String(userId) },
        };

        const session = await stripe.checkout.sessions.create(sessionParams);
        if (!session.url) {
            throw new InternalServerErrorException("Checkout session missing URL");
        }
        return { url: session.url };
    }

    async createPortalSession(userId: number) {
        const stripe = this.requireStripe();
        const frontendUrl = this.config.get<string>("FRONTEND_URL")?.replace(/\/$/, "") || "";
        if (!frontendUrl) {
            throw new InternalServerErrorException("FRONTEND_URL is not set");
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.stripeCustomerId) {
            throw new BadRequestException("No billing account on file");
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${frontendUrl}/settings/subscription`,
        });
        return { url: session.url };
    }

    async getBillingStatus(userId: number) {
        await this.syncSubscriptionFromStripeForUser(userId);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) throw new BadRequestException("User not found");

        const now = new Date();
        const sub = user.subscription;
        const recurringActive =
            sub &&
            (sub.status === SubscriptionStatus.active || sub.status === SubscriptionStatus.trialing) &&
            (!sub.endedAt || sub.endedAt > now) &&
            sub.currentPeriodEnd > now;

        return {
            stripeCustomerId: user.stripeCustomerId,
            lifetimeVip: false,
            subscription: sub
                ? {
                      status: sub.status,
                      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
                      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                      isActive: !!recurringActive,
                  }
                : null,
        };
    }

    async getBillingHistory(userId: number) {
        await this.syncSubscriptionFromStripeForUser(userId);

        const invoices = await this.prisma.stripeInvoice.findMany({
            where: { userId },
            orderBy: { occurredAt: "desc" },
            take: 50,
            select: {
                stripeInvoiceId: true,
                status: true,
                totalCents: true,
                amountPaidCents: true,
                currency: true,
                hostedInvoiceUrl: true,
                invoicePdfUrl: true,
                paidAt: true,
                occurredAt: true,
            } as any,
        });

        return {
            invoices: (invoices as any[]).map((i) => ({
                stripeInvoiceId: i.stripeInvoiceId,
                status: i.status ?? null,
                totalCents: i.totalCents ?? null,
                amountPaidCents: i.amountPaidCents ?? null,
                currency: i.currency,
                hostedInvoiceUrl: i.hostedInvoiceUrl ?? null,
                invoicePdfUrl: i.invoicePdfUrl ?? null,
                paidAt: i.paidAt ? i.paidAt.toISOString() : null,
                occurredAt: i.occurredAt ? i.occurredAt.toISOString() : null,
            })),
            // Kept for backwards-compat with older clients; ledger has been removed.
            ledger: [],
        };
    }

    async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
        const stripe = this.requireStripe();
        const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
        if (!webhookSecret) {
            throw new InternalServerErrorException("STRIPE_WEBHOOK_SECRET is not set");
        }
        if (!signature) {
            throw new BadRequestException("Missing stripe-signature header");
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err) {
            this.logger.warn(`Webhook signature verification failed: ${err}`);
            throw new BadRequestException("Invalid signature");
        }

        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await this.onCheckoutSessionCompleted(
                        event.data.object,
                    );
                    break;
                case "customer.subscription.updated":
                case "customer.subscription.created":
                    await this.onSubscriptionUpdated(event.data.object);
                    break;
                case "customer.subscription.deleted":
                    await this.onSubscriptionDeleted(event.data.object);
                    break;
                case "invoice.paid":
                    await this.onInvoicePaid(event, event.data.object);
                    break;
                case "invoice.payment_failed":
                    this.logger.warn(
                        `Invoice payment failed: ${(event.data.object).id}`,
                    );
                    break;
                default:
                    break;
            }
        } catch (e) {
            this.logger.error(`Webhook handler error for ${event.type}`, e);
            throw e;
        }

        return { received: true };
    }

    private async resolveUserIdFromSubscription(sub: Stripe.Subscription): Promise<number | null> {
        const meta = sub.metadata?.userId;
        if (meta) {
            const id = parseInt(meta, 10);
            if (Number.isFinite(id)) return id;
        }
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) return null;
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        return user?.id ?? null;
    }

    private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        const stripe = this.requireStripe();
        const userId = parseInt(session.metadata?.userId || session.client_reference_id || "", 10);
        if (!Number.isFinite(userId)) {
            this.logger.warn("checkout.session.completed missing userId metadata");
            return;
        }

        const customerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (customerId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }

        if (session.mode === "subscription" && session.subscription) {
            const subId =
                typeof session.subscription === "string"
                    ? session.subscription
                    : session.subscription.id;
            const sub = await stripe.subscriptions.retrieve(subId);
            await this.upsertSubscriptionRow(userId, sub);
        }
    }

    private async onSubscriptionUpdated(sub: Stripe.Subscription) {
        const userId = await this.resolveUserIdFromSubscription(sub);
        if (!userId) {
            this.logger.warn(`subscription ${sub.id} could not be mapped to a user`);
            return;
        }
        await this.upsertSubscriptionRow(userId, sub);
    }

    private async onSubscriptionDeleted(sub: Stripe.Subscription) {
        if (!Number.isFinite(sub.current_period_end)) {
            this.logger.warn(
                `subscription.deleted ${sub.id} missing current_period_end; skipping DB update`,
            );
            return;
        }
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
                status: this.mapStripeSubscriptionStatus(sub.status),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : new Date(),
            },
        });
    }

    private async upsertSubscriptionRow(userId: number, sub: Stripe.Subscription) {
        if (!Number.isFinite(sub.current_period_end)) {
            this.logger.warn(`Subscription ${sub.id} missing current_period_end; skip upsert`);
            return;
        }

        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                stripeSubscriptionId: sub.id,
                status: this.mapStripeSubscriptionStatus(sub.status),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
                endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : null,
            },
            update: {
                stripeSubscriptionId: sub.id,
                status: this.mapStripeSubscriptionStatus(sub.status),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
                endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : null,
            },
        });
    }

    private async onInvoicePaid(event: Stripe.Event, invoice: Stripe.Invoice) {
        if (!invoice.id || invoice.amount_paid == null) return;

        const customerId =
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        let userId: number | null = null;
        if (customerId) {
            const user = await this.prisma.user.findFirst({
                where: { stripeCustomerId: customerId },
            });
            userId = user?.id ?? null;
        }

        const paidAt = invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : new Date();

        const stripeChargeId =
            typeof invoice.charge === "string" ? invoice.charge : invoice.charge?.id;

        await this.prisma.stripeInvoice.upsert({
            where: { stripeInvoiceId: invoice.id },
            create: {
                stripeInvoiceId: invoice.id,
                userId,
                status: invoice.status ?? null,
                totalCents: invoice.total ?? null,
                amountPaidCents: invoice.amount_paid ?? null,
                currency: invoice.currency || "usd",
                hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
                invoicePdfUrl: invoice.invoice_pdf ?? null,
                paidAt,
                occurredAt: paidAt,
            },
            update: {
                userId,
                status: invoice.status ?? null,
                totalCents: invoice.total ?? null,
                amountPaidCents: invoice.amount_paid ?? null,
                currency: invoice.currency || "usd",
                hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
                invoicePdfUrl: invoice.invoice_pdf ?? null,
                paidAt,
                occurredAt: paidAt,
            },
        });
    }
}
