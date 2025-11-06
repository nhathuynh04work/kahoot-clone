import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { LobbyStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class GameService {
    private logger = new Logger("GAME SERVICE");

    constructor(private prisma: PrismaService) {}

    async getValidLobby(pin: string) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { pin },
            include: {
                quiz: {
                    select: { title: true },
                },
            },
        });

        if (!lobby) throw new NotFoundException(`Game PIN "${pin}" not found.`);

        if (lobby.status !== LobbyStatus.WAITING)
            throw new ConflictException(
                `This game is not waiting for players (Status: ${lobby.status}).`,
            );

        return lobby;
    }

    async createLobby(quizId: number, hostId: number): Promise<string> {
        const uniqueKey = `${hostId}-${quizId}`;

        // Check if an active game lobby already exists
        const lobby = await this.prisma.gameLobby.findUnique({
            where: { activeHostQuizKey: uniqueKey },
        });

        if (lobby) {
            this.logger.log(
                `Host ${hostId} already has active lobby for quiz ${quizId}. Returning existing PIN.`,
            );
            return lobby.pin;
        }

        // If no active lobby exists, generate a unique active PIN
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

        try {
            const newLobby = await this.prisma.gameLobby.create({
                data: {
                    pin,
                    quizId,
                    hostId,
                    status: LobbyStatus.WAITING,
                    activeHostQuizKey: uniqueKey,
                },
            });
            return newLobby.pin;
        } catch (error) {
            // Handle the race condition from dev server double-requests
            if (error.code === "P2002") {
                this.logger.warn(
                    `Race condition detected for host ${hostId} / quiz ${quizId}. Fetching existing lobby.`,
                );

                const lobby = await this.prisma.gameLobby.findUnique({
                    where: { activeHostQuizKey: uniqueKey },
                });

                if (lobby) return lobby.pin;
            }
            throw error;
        }
    }

    async addPlayerToLobby(params: {
        pin: string;
        nickname: string;
        socketId: string;
    }) {
        const { pin, nickname, socketId } = params;

        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                pin,
                status: LobbyStatus.WAITING,
            },
        });

        if (!lobby)
            throw new NotFoundException(
                `Game PIN "${pin}" not found or is not waiting.`,
            );

        try {
            return await this.prisma.gamePlayer.create({
                data: {
                    nickname,
                    socketId,
                    lobbyId: lobby.id,
                },
            });
        } catch (error) {
            if (error.code === "P2002")
                throw new ConflictException(
                    `Nickname "${nickname}" is already taken in this lobby.`,
                );

            throw error;
        }
    }

    async endLobby(pin: string, hostId: number) {
        await this.prisma.gameLobby.updateMany({
            where: {
                pin: pin,
                hostId: hostId,
                status: LobbyStatus.IN_PROGRESS,
            },
            data: {
                status: LobbyStatus.FINISHED,
                activeHostQuizKey: null,
            },
        });
    }
}
