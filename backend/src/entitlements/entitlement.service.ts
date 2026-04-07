import { Injectable } from "@nestjs/common";
import { UserRole } from "../generated/prisma/client.js";
import { SubscriptionStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
    MAX_DOCUMENTS_FREE,
    MAX_DOCUMENTS_VIP,
    MAX_QUESTIONS_FREE,
    MAX_QUESTIONS_VIP,
    MAX_TOTAL_STORAGE_BYTES_FREE,
    MAX_TOTAL_STORAGE_BYTES_VIP,
} from "./entitlements.constants.js";

export type VipStatus = {
    isVip: boolean;
    source: "none" | "admin" | "subscription";
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
};

export type EntitlementLimits = {
    maxQuestionsPerQuiz: number;
    maxDocuments: number;
    maxTotalStorageBytes: number;
    canUseShortAnswerAndRange: boolean;
};

@Injectable()
export class EntitlementService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getVipStatus(userId: number): Promise<VipStatus> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            return { isVip: false, source: "none" };
        }
        if (user.role === UserRole.ADMIN) {
            return { isVip: true, source: "admin" };
        }
        const sub = user.subscription;
        const now = new Date();
        if (
            sub &&
            (sub.status === SubscriptionStatus.active || sub.status === SubscriptionStatus.trialing) &&
            (!sub.endedAt || sub.endedAt > now) &&
            sub.currentPeriodEnd > now
        ) {
            return {
                isVip: true,
                source: "subscription",
                currentPeriodEnd: sub.currentPeriodEnd,
                cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            };
        }
        return { isVip: false, source: "none" };
    }

    getLimitsForVip(isVip: boolean): EntitlementLimits {
        return {
            maxQuestionsPerQuiz: isVip ? MAX_QUESTIONS_VIP : MAX_QUESTIONS_FREE,
            maxDocuments: isVip ? MAX_DOCUMENTS_VIP : MAX_DOCUMENTS_FREE,
            maxTotalStorageBytes: isVip ? MAX_TOTAL_STORAGE_BYTES_VIP : MAX_TOTAL_STORAGE_BYTES_FREE,
            canUseShortAnswerAndRange: isVip,
        };
    }

    async getLimitsForUser(userId: number): Promise<EntitlementLimits> {
        const { isVip } = await this.getVipStatus(userId);
        return this.getLimitsForVip(isVip);
    }
}
