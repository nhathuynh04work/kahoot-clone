import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

const RETENTION_DAYS = 30;

@Injectable()
export class AiChatRetentionJob {
    private readonly logger = new Logger(AiChatRetentionJob.name);

    constructor(private prisma: PrismaService) {}

    // Daily at 03:00 server time
    @Cron("0 3 * * *")
    async cleanupInactiveChats() {
        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

        const { count } = await this.prisma.aiQuizChatSession.deleteMany({
            where: { lastActivityAt: { lt: cutoff } },
        });

        if (count > 0) {
            this.logger.log(
                JSON.stringify({
                    event: "ai.chat.retention.cleanup",
                    deletedSessions: count,
                    retentionDays: RETENTION_DAYS,
                }),
            );
        }
    }
}

