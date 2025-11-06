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
    private logger = new Logger("GameService");

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

    async createLobby(params: {
        quizId: number;
        hostId: number;
        socketId: string;
    }): Promise<string> {
        const { quizId, hostId, socketId } = params;
        const uniqueKey = `${hostId}-${quizId}`;

        // Check if an active game lobby already exists
        const lobby = await this.prisma.gameLobby.findUnique({
            where: { activeHostQuizKey: uniqueKey },
        });

        // CASE: Lobby exists (Host rejoining lobby)
        if (lobby) {
            this.logger.log(`Host ${hostId} is rejoining lobby ${lobby.pin}`);
            return lobby.pin;
        }

        // CASE: Lobby doesn't exist (Host create new lobby)
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
                    hostSocketId: socketId,
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

    async closeStaleLobby(hostSocketId: string) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                hostSocketId: hostSocketId,
                status: LobbyStatus.WAITING,
            },
        });

        // CASE: No lobby found (ex: host reconnected with new socket)
        if (!lobby) return false;

        // CASE: Host truly gone. Remove the lobby
        await this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: {
                status: LobbyStatus.CLOSED,
                activeHostQuizKey: null,
            },
        });

        this.logger.log(`Closed stale lobby with PIN ${lobby.pin}`);
        return lobby.pin;
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

    async removePlayer(socketId: string) {
        const player = await this.prisma.gamePlayer.findUnique({
            where: { socketId },
            include: { lobby: true },
        });

        // CASE: Player not found (e.g., it was a host or just a visitor), do nothing.
        if (!player) return null;

        // CASE: Player found, delete them
        await this.prisma.gamePlayer.delete({
            where: { id: player.id },
        });

        this.logger.log(
            `Removed player ${player.nickname} (ID: ${player.id}) from lobby ${player.lobby.pin}`,
        );

        // 4. Return the necessary info to notify the room
        return {
            pin: player.lobby.pin,
            playerId: player.id,
            nickname: player.nickname,
        };
    }
}
