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
import type { PriceKey } from "./dto/checkout-session.dto.js";

const PRICE_ENV_KEYS: Record<PriceKey, string> = {
    monthly: "STRIPE_PRICE_MONTHLY",
    quarterly: "STRIPE_PRICE_QUARTERLY",
    yearly: "STRIPE_PRICE_YEARLY",
    lifetime: "STRIPE_PRICE_LIFETIME",
};

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

    getPriceId(key: PriceKey): string {
        const envKey = PRICE_ENV_KEYS[key];
        const id = this.config.get<string>(envKey);
        if (!id?.trim()) {
            throw new BadRequestException(
                `Missing env ${envKey}. Add your Stripe Price ID for the ${key} plan.`,
            );
        }
        return id.trim();
    }

    resolvePlanKeyFromPriceId(priceId: string | null | undefined): string | null {
        if (!priceId) return null;
        for (const [key, envKey] of Object.entries(PRICE_ENV_KEYS) as [PriceKey, string][]) {
            const v = this.config.get<string>(envKey);
            if (v?.trim() === priceId) return key;
        }
        return null;
    }

    async createCheckoutSession(userId: number, email: string, priceKey: PriceKey) {
        const stripe = this.requireStripe();
        const frontendUrl = this.config.get<string>("FRONTEND_URL")?.replace(/\/$/, "") || "";
        if (!frontendUrl) {
            throw new InternalServerErrorException("FRONTEND_URL is not set");
        }

        const priceId = this.getPriceId(priceKey);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException("User not found");

        const mode = priceKey === "lifetime" ? "payment" : "subscription";

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode,
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

        if (mode === "subscription") {
            sessionParams.subscription_data = {
                metadata: { userId: String(userId) },
            };
        }

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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) throw new BadRequestException("User not found");

        const now = new Date();
        const sub = user.subscription;
        const recurringActive =
            sub &&
            (sub.status === "active" || sub.status === "trialing") &&
            sub.currentPeriodEnd > now;

        return {
            stripeCustomerId: user.stripeCustomerId,
            lifetimeVip: user.lifetimeVip,
            subscription: sub
                ? {
                      status: sub.status,
                      stripePriceId: sub.stripePriceId,
                      planKey: this.resolvePlanKeyFromPriceId(sub.stripePriceId),
                      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
                      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                      isActive: !!recurringActive,
                  }
                : null,
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
            await this.prisma.stripeProcessedEvent.create({
                data: { eventId: event.id },
            });
        } catch (e: unknown) {
            const code = (e as { code?: string })?.code;
            if (code === "P2002") {
                this.logger.debug(`Skip duplicate webhook event ${event.id}`);
                return { received: true };
            }
            throw e;
        }

        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await this.onCheckoutSessionCompleted(
                        event.data.object as Stripe.Checkout.Session,
                    );
                    break;
                case "customer.subscription.updated":
                case "customer.subscription.created":
                    await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
                    break;
                case "customer.subscription.deleted":
                    await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
                    break;
                case "invoice.paid":
                    await this.onInvoicePaid(event.data.object as Stripe.Invoice);
                    break;
                case "invoice.payment_failed":
                    this.logger.warn(
                        `Invoice payment failed: ${(event.data.object as Stripe.Invoice).id}`,
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

        if (session.mode === "payment" && session.payment_status === "paid") {
            await this.prisma.user.update({
                where: { id: userId },
                data: { lifetimeVip: true },
            });
            return;
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
        await this.prisma.subscription.deleteMany({
            where: { stripeSubscriptionId: sub.id },
        });
    }

    private async upsertSubscriptionRow(userId: number, sub: Stripe.Subscription) {
        const priceId = sub.items.data[0]?.price?.id;
        if (!priceId) {
            this.logger.warn(`Subscription ${sub.id} has no price on first item`);
            return;
        }

        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                stripeSubscriptionId: sub.id,
                stripePriceId: priceId,
                status: sub.status,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
            update: {
                stripeSubscriptionId: sub.id,
                stripePriceId: priceId,
                status: sub.status,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
        });
    }

    private async onInvoicePaid(invoice: Stripe.Invoice) {
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

        await this.prisma.revenueLedgerEntry.upsert({
            where: { stripeInvoiceId: invoice.id },
            create: {
                stripeInvoiceId: invoice.id,
                amountCents: invoice.amount_paid,
                currency: invoice.currency || "usd",
                userId,
                occurredAt: paidAt,
            },
            update: {
                amountCents: invoice.amount_paid,
                currency: invoice.currency || "usd",
                userId,
                occurredAt: paidAt,
            },
        });
    }
}
