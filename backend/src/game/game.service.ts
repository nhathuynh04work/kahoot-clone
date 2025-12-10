import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { LobbyStatus } from "../generated/prisma/enums.js";
import { QuestionService } from "../question/question.service.js";

@Injectable()
export class GameService {
    private logger = new Logger("GameService");

    /**
     * HOST MAPPINGS
     * 1. hostSocketMap: SocketID -> LobbyID (Reverse lookup to find lobby by socket).
     * A host can have many connections (dead and active) to 1 lobby (refresh page, rejoin,...)
     *
     * 2. lobbyHostMap: LobbyID -> SocketID (Forward lookup to know the *current* active socket)
     * An active lobby can only belong to 1 active socket connection
     */
    private readonly hostSocketMap = new Map<string, number>();
    private readonly lobbyHostMap = new Map<number, string>();

    /**
     * PLAYER MAPPINGS
     * 1. playerSocketMap: SocketID -> PlayerID (Reverse lookup for events)
     * 2. connectedPlayerIds: Set of PlayerIDs currently online (To prevent duplicate joins)
     */
    private readonly playerSocketMap = new Map<string, number>();
    private readonly connectedPlayerIds = new Set<number>();

    constructor(
        private prisma: PrismaService,
        private questionService: QuestionService,
    ) {}

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

        // 1. Check for existing active lobby using business keys (Host + Quiz)
        const existingLobby = await this.prisma.gameLobby.findFirst({
            where: {
                quizId,
                hostId,
                status: { in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS] },
            },
        });

        // CASE: Lobby exists (Host rejoining active session)
        if (existingLobby) {
            this.logger.log(
                `Host ${hostId} is rejoining lobby ${existingLobby.pin}`,
            );

            // Update in-memory maps for the new connection
            this.hostSocketMap.set(socketId, existingLobby.id);
            this.lobbyHostMap.set(existingLobby.id, socketId);

            return existingLobby.pin;
        }

        // CASE: New Lobby - Generate unique PIN
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
                },
            });

            // Map the host's socket to this new lobby
            this.hostSocketMap.set(socketId, newLobby.id);
            this.lobbyHostMap.set(newLobby.id, socketId);

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

                if (lobby) {
                    this.hostSocketMap.set(socketId, lobby.id);
                    this.lobbyHostMap.set(lobby.id, socketId);
                    return lobby.pin;
                }
            }
            throw error;
        }
    }

    async closeStaleLobby(hostSocketId: string) {
        // 1. Look up Lobby ID from Memory
        const lobbyId = this.hostSocketMap.get(hostSocketId);
        if (!lobbyId) return false;

        // 2. CHECK RECONNECTION: Is this socket still the "active" one?
        // If the map has a different socket ID for this lobby, it means the host reconnected.
        // And therefore we only delete the old host-to-lobby mapping
        const activeSocket = this.lobbyHostMap.get(lobbyId);
        if (activeSocket && activeSocket !== hostSocketId) {
            this.hostSocketMap.delete(hostSocketId);
            return false;
        }

        // 3. Fetch lobby to ensure it's still in a state that should be closed (WAITING)
        const lobby = await this.prisma.gameLobby.findUnique({
            where: { id: lobbyId },
        });

        // CASE: Lobby doesn't exist or is already started (IN_PROGRESS)
        if (!lobby || lobby.status !== LobbyStatus.WAITING) {
            this.hostSocketMap.delete(hostSocketId);
            if (activeSocket === hostSocketId)
                this.lobbyHostMap.delete(lobbyId);
            return false;
        }

        // CASE: Host left a WAITING lobby -> Close it
        await this.prisma.gameLobby.update({
            where: { id: lobbyId },
            data: {
                status: LobbyStatus.CLOSED,
            },
        });

        // Clean up memory
        this.hostSocketMap.delete(hostSocketId);
        this.lobbyHostMap.delete(lobbyId);

        this.logger.log(`Closed stale lobby with PIN ${lobby.pin}`);
        return lobby.pin;
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

        if (!lobby)
            throw new NotFoundException(
                "Active lobby not found for this host.",
            );

        return this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: { status: status },
        });
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
            },
        });
        // Note: We don't manually clear maps here; they clear on disconnect/restart.
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

        // Check DB for existing player
        const existingPlayer = await this.prisma.gamePlayer.findUnique({
            where: {
                lobbyId_nickname: {
                    lobbyId: lobby.id,
                    nickname: nickname,
                },
            },
        });

        if (existingPlayer) {
            // Check In-Memory: Is this player currently connected?
            if (this.connectedPlayerIds.has(existingPlayer.id)) {
                throw new ConflictException(
                    `Nickname "${nickname}" is already taken in this lobby.`,
                );
            }

            // REJOIN Logic
            this.logger.log(`Player ${nickname} is rejoining lobby ${pin}`);

            this.playerSocketMap.set(socketId, existingPlayer.id);
            this.connectedPlayerIds.add(existingPlayer.id);

            return existingPlayer;
        }

        // CREATE NEW Logic
        try {
            const newPlayer = await this.prisma.gamePlayer.create({
                data: {
                    nickname,
                    lobbyId: lobby.id,
                },
            });

            this.playerSocketMap.set(socketId, newPlayer.id);
            this.connectedPlayerIds.add(newPlayer.id);

            return newPlayer;
        } catch (error) {
            if (error.code === "P2002")
                throw new ConflictException(
                    `Nickname "${nickname}" is already taken in this lobby.`,
                );

            throw error;
        }
    }

    async disconnectPlayer(socketId: string) {
        // 1. Identify Player from Memory
        const playerId = this.playerSocketMap.get(socketId);
        if (!playerId) return null;

        // 2. Fetch details for return value
        const player = await this.prisma.gamePlayer.findUnique({
            where: { id: playerId },
            include: { lobby: true },
        });

        // 3. Clean up Memory
        this.playerSocketMap.delete(socketId);
        this.connectedPlayerIds.delete(playerId);

        if (!player) return null;

        this.logger.log(
            `Player ${player.nickname} (ID: ${player.id}) disconnected from lobby ${player.lobby.pin}`,
        );

        return {
            pin: player.lobby.pin,
            playerId: player.id,
            nickname: player.nickname,
        };
    }

    async savePlayerAnswer(params: {
        socketId: string;
        questionId: number;
        optionId: number;
    }) {
        const { socketId, questionId, optionId } = params;

        // 1. Identify Player from Memory
        const playerId = this.playerSocketMap.get(socketId);
        if (!playerId)
            throw new NotFoundException("Player not found (Socket mismatch)");

        const player = await this.prisma.gamePlayer.findUnique({
            where: { id: playerId },
            include: { lobby: true },
        });

        if (!player) throw new NotFoundException("Player not found in DB");

        if (player.lobby.status !== LobbyStatus.IN_PROGRESS)
            throw new Error(
                "Cannot save answer for lobby that is not in progress.",
            );

        const { isCorrect, points } = await this.questionService.gradeAnswer({
            questionId,
            optionId,
        });

        const [playerAnswer] = await this.prisma.$transaction([
            this.prisma.playerAnswer.create({
                data: {
                    playerId: player.id,
                    questionId,
                    optionId,
                    isCorrect,
                    scoreEarned: points,
                },
            }),

            this.prisma.gamePlayer.update({
                where: { id: player.id },
                data: { score: { increment: points } },
            }),
        ]);

        return {
            answer: playerAnswer,
            lobbyId: player.lobby.id,
        };
    }

    getAnswerCountForQuestion(lobbyId: number, questionId: number) {
        return this.prisma.playerAnswer.count({
            where: {
                questionId,
                player: {
                    lobbyId: lobbyId,
                },
            },
        });
    }
}
