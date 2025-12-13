import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { LobbyStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export class LobbyService {
    private logger = new Logger(LobbyService.name);

    constructor(private prisma: PrismaService) {}

    async findActiveLobby(
        params: { pin: string } | { hostId: number; quizId: number },
    ) {
        const whereCondition: Prisma.GameLobbyWhereInput = {
            status: { in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS] },
        };

        if ("pin" in params) {
            whereCondition.pin = params.pin;
        } else {
            whereCondition.quizId = params.quizId;
            whereCondition.hostId = params.hostId;
        }

        const lobby = await this.prisma.gameLobby.findFirst({
            where: whereCondition,
            include: { quiz: true },
        });

        if (!lobby) {
            const errorMsg =
                "pin" in params
                    ? `Active lobby with PIN ${params.pin} not found.`
                    : `Active lobby for this Host/Quiz combination not found.`;

            throw new NotFoundException(errorMsg);
        }

        return lobby;
    }

    private async getUniquePin() {
        let pin = "000000";
        let isPinInUse = true;

        while (isPinInUse) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const lobby = await this.prisma.gameLobby.findFirst({
                where: {
                    pin: pin,
                    status: {
                        in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS],
                    },
                },
            });

            if (!lobby) isPinInUse = false;
        }

        return pin;
    }

    async createLobby(params: { quizId: number; hostId: number }) {
        const { quizId, hostId } = params;

        const existing = await this.findActiveLobby({ quizId, hostId });

        // [TO-DO]: NO REJOINING LOGIC
        if (existing) {
            this.logger.log("Found existing lobby. Activate rejoining logic");
            return existing;
        }

        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { _count: { select: { questions: true } } },
        });

        if (!quiz || quiz?._count.questions < 1) {
            throw new BadRequestException("Quiz not valid to start new game.");
        }

        const pin = await this.getUniquePin();
        const newLobby = this.prisma.gameLobby.create({
            data: { pin, quizId, hostId, status: LobbyStatus.WAITING },
        });

        return newLobby;
    }
}
