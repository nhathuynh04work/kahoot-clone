import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { LobbyStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class LobbyService {
    private logger = new Logger("LobbyService");

    constructor(private prisma: PrismaService) {}

    async createLobby(params: {
        quizId: number;
        hostId: number;
    }): Promise<string> {
        const { quizId, hostId } = params;

        // 1. Validate Quiz exists and has content
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { _count: { select: { questions: true } } },
        });

        if (!quiz || quiz._count.questions < 1) {
            throw new BadRequestException("Quiz invalid or empty.");
        }

        // 2. Check for existing active lobby
        const existingLobby = await this.prisma.gameLobby.findFirst({
            where: {
                quizId,
                hostId,
                status: { in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS] },
            },
        });

        if (existingLobby) {
            this.logger.log(
                `Host ${hostId} is rejoining existing lobby ${existingLobby.pin}`,
            );
            return existingLobby.pin;
        }

        // 3. Generate Unique PIN
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

        // 4. Create Lobby with Race Condition Handling
        try {
            const newLobby = await this.prisma.gameLobby.create({
                data: {
                    pin,
                    quizId,
                    hostId,
                    status: LobbyStatus.WAITING,
                },
            });

            return newLobby.pin;
        } catch (error) {
            // Handle Race Condition (Unique Constraint on Partial Index)
            if (error.code === "P2002") {
                this.logger.warn(
                    `Race condition detected for host ${hostId} / quiz ${quizId}. Fetching existing lobby.`,
                );

                const lobby = await this.prisma.gameLobby.findFirst({
                    where: {
                        quizId,
                        hostId,
                        status: {
                            in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS],
                        },
                    },
                });

                if (lobby) return lobby.pin;
            }
            throw error;
        }
    }

    async getValidLobby(pin: string) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                pin,
                status: { notIn: [LobbyStatus.FINISHED, LobbyStatus.CLOSED] },
            },
            include: {
                quiz: {
                    select: { title: true },
                },
            },
        });

        if (!lobby) {
            throw new NotFoundException(
                `Cannot find active lobby with PIN ${pin}`,
            );
        }

        return lobby;
    }

    async changeLobbyStatus(params: {
        quizId: number;
        hostId: number;
        status: LobbyStatus;
    }) {
        const { quizId, hostId, status } = params;

        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                quizId,
                hostId,
                status: { notIn: [LobbyStatus.FINISHED, LobbyStatus.CLOSED] },
            },
        });

        if (!lobby) {
            throw new NotFoundException(
                "Active lobby not found for this host.",
            );
        }

        return this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: { status },
        });
    }

    async addPlayer(params: { pin: string; nickname: string }) {
        const { pin, nickname } = params;

        // 1. Validate Lobby
        const lobby = await this.getValidLobby(pin);

        // 2. Check for existing player (Rejoin logic)
        const existingPlayer = await this.prisma.gamePlayer.findUnique({
            where: {
                lobbyId_nickname: {
                    lobbyId: lobby.id,
                    nickname: nickname,
                },
            },
        });

        if (existingPlayer) {
            // Note: The Gateway is responsible for checking if this player
            // is currently "online" (Imposter check) using SocketManager.
            return existingPlayer;
        }

        // 3. New Player Checks
        // If the game has already started, we generally don't allow new players
        if (lobby.status !== LobbyStatus.WAITING) {
            throw new ConflictException(
                "Game has already started. You cannot join as a new player.",
            );
        }

        // 4. Create New Player
        try {
            return await this.prisma.gamePlayer.create({
                data: {
                    nickname,
                    lobbyId: lobby.id,
                    score: 0,
                },
            });
        } catch (error) {
            // Handle unique constraint violation (Race condition on nickname)
            if (error.code === "P2002") {
                throw new ConflictException(
                    `Nickname "${nickname}" is already taken in this lobby.`,
                );
            }
            throw error;
        }
    }
}
