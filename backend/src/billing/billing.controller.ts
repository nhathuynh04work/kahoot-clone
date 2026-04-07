import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    Post,
    Get,
    Req,
    UseGuards,
    HttpCode,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common/interfaces";
import type { Request } from "express";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { User, type JwtUser } from "../auth/user.decorator.js";
import { BillingService } from "./billing.service.js";
import { CheckoutSessionDto } from "./dto/checkout-session.dto.js";

@Controller("billing")
export class BillingController {
    constructor(private readonly billing: BillingService) {}

    @UseGuards(JwtHttpGuard)
    @Post("checkout-session")
    async checkoutSession(@User() user: JwtUser, @Body() body: CheckoutSessionDto) {
        return this.billing.createCheckoutSession(user.id, user.email, body.priceKey);
    }

    @UseGuards(JwtHttpGuard)
    @Post("portal-session")
    async portalSession(@User() user: JwtUser) {
        return this.billing.createPortalSession(user.id);
    }

    @UseGuards(JwtHttpGuard)
    @Get("status")
    async status(@User() user: JwtUser) {
        return this.billing.getBillingStatus(user.id);
    }

    @Post("webhook")
    @HttpCode(200)
    async webhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers("stripe-signature") signature: string | undefined,
    ) {
        const raw = req.rawBody;
        if (!raw) {
            throw new BadRequestException(
                "Missing raw body for Stripe webhook (enable rawBody in NestFactory)",
            );
        }
        return this.billing.handleStripeWebhook(Buffer.isBuffer(raw) ? raw : Buffer.from(raw), signature);
    }
}
