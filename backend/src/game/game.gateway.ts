import { LobbyService } from "./services/lobby.service";
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
    ConflictException,
    Inject,
    Logger,
    NotFoundException,
    UseGuards,
} from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";
import { SocketService } from "./services/socket.service";
import { LobbyStatus } from "../generated/prisma/client";
import Redis from "ioredis";

@WebSocketGateway()
export class GameGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
    @WebSocketServer()
    server: Server;

    private logger = new Logger("GameGateway");

    constructor(
        private lobbyService: LobbyService,
        private socketService: SocketService,
        @Inject("REDIS_CLIENT") private redis: Redis,
    ) {}

    afterInit(server: Server) {
        this.socketService.setServer(server);
        this.logger.log("SocketService initialized with server instance");
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        const { isHost, lobbyId, nickname } = client.data || {};

        if (!lobbyId) {
            this.logger.log(`Client disconnected: ${client.id}`);
            return;
        }

        if (isHost) {
            this.logger.log(`Host disconnected. Destroying lobby ${lobbyId}`);

            this.socketService.emitToRoom(lobbyId.toString(), "hostLeft");

            await this.lobbyService.updateLobbyStatus(
                lobbyId,
                LobbyStatus.CLOSED,
            );

            return;
        }

        this.logger.log(`Player ${nickname} left lobby ${lobbyId}.`);
        this.socketService.emitToRoom(lobbyId.toString(), "playerLeft", {
            nickname,
        });

        this.lobbyService.updatePlayerOnlineStatus({
            nickname,
            lobbyId,
            isOnline: false,
        });
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("hostJoin")
    async handleHostJoin(
        @User() user: JwtUser,
        @MessageBody() payload: { lobbyId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const { lobbyId } = payload;

        if (client.data.lobbyId === lobbyId) {
            this.logger.debug(
                `Duplicate join request for ${lobbyId} blocked (Strict Mode).`,
            );
            return { success: true };
        }

        client.data.isHost = true;
        client.data.lobbyId = lobbyId;

        let lobby;
        try {
            lobby = await this.lobbyService.findLobbyById(lobbyId);
        } catch (error) {
            return { success: false };
        }

        if (lobby.hostId !== user.id) {
            return { success: false };
        }

        if (lobby.status !== LobbyStatus.CREATED) {
            return { success: false };
        }

        await this.lobbyService.updateLobbyStatus(lobbyId, LobbyStatus.WAITING);

        await client.join(`${lobbyId}`);
        this.logger.log(`Host joined lobby ${lobbyId}`);
        return { success: true, pin: lobby.pin };
    }

    @SubscribeMessage("playerJoin")
    async handlePlayerJoin(
        @MessageBody()
        payload: { pin: string; nickname: string; rejoin: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        /* 
            A few cases that needs to be handled:
            - New player joining
            - Already joined user use the url to access the game -> don't allow
            - User rejoin on RejoinDialog -> check the rejoin flag
            - Race condition -> use isJoining to disable double request
        */

        if (client.data.isJoining) {
            this.logger.debug("Duplicate request");
            return { success: true };
        }

        client.data.isJoining = true;

        const { pin, nickname, rejoin } = payload;

        try {
            const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

            const player = await this.lobbyService.findPlayerInLobby({
                nickname,
                lobbyId: lobby.id,
            });

            if (!player) throw new NotFoundException("Player not found");

            if (rejoin) {
                client.data.isHost = false;
                client.data.lobbyId = player.lobbyId;
                client.data.nickname = nickname;
                await client.join(`${player.lobbyId}`);

                this.socketService.emitToRoom(
                    lobby.id.toString(),
                    "playerRejoined",
                    { player: player, newSocketId: client.id },
                );

                this.logger.log(
                    `Player ${nickname} (socketID: ${client.id}) has rejoined`,
                );

                return { success: true };
            }

            if (player.isOnline)
                throw new ConflictException("Player is active somewhere");

            await this.lobbyService.updatePlayerOnlineStatus({
                nickname: player.nickname,
                lobbyId: lobby.id,
                isOnline: true,
            });

            client.data.isHost = false;
            client.data.lobbyId = player.lobbyId;
            client.data.nickname = nickname;
            await client.join(`${player.lobbyId}`);

            this.socketService.emitToRoom(
                player.lobbyId.toString(),
                "playerJoined",
                { player },
            );

            this.logger.log(
                `Player ${nickname} (socketID: ${client.id}) is online`,
            );

            return { success: true };
        } catch (error) {
            return { success: false };
        } finally {
            client.data.isJoining = false;
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("startGame")
    async handleStartGame(@MessageBody() payload: { pin: string }) {
        const { pin } = payload;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        // Cannot start a lobby that has already started
        if (lobby.status === LobbyStatus.IN_PROGRESS) {
            return { success: false };
        }

        // Update status
        await this.lobbyService.updateLobbyStatus(
            lobby.id,
            LobbyStatus.IN_PROGRESS,
        );

        // Get the question
        const questions = await this.lobbyService.getQuestionListOfLobby(
            lobby.id,
            { includeAnswer: false },
        );

        this.socketService.emitToRoom(lobby.id.toString(), "newQuestion", {
            currentQuestionIndex: lobby.currentQuestionIndex,
            currentQuestion: questions[lobby.currentQuestionIndex],
            totalQuestions: questions.length,
        });

        return { success: true };
    }

    @SubscribeMessage("submitAnswer")
    async handleSubmitAnswer(
        @MessageBody()
        body: {
            optionId: number;
            questionId: number;
            nickname: string;
            pin: string;
        },
    ) {
        const { optionId, questionId, nickname, pin } = body;

        try {
            const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

            const player = await this.lobbyService.findPlayerInLobby({
                nickname,
                lobbyId: lobby.id,
            });

            if (!player) {
                throw new ConflictException(
                    "Player does not belong to this lobby",
                );
            }

            // grade the answer
            const result = await this.lobbyService.gradeAnswer({
                questionId,
                optionId,
            });

            // save answer
            const savedAnswer = await this.lobbyService.saveAnswer({
                optionId,
                questionId,
                playerId: player?.id,
                ...result,
            });

            this.logger.log(
                `Player ${nickname} submitted their answer. It's ${savedAnswer.isCorrect ? "correct" : "incorrect"}. Points earned: ${savedAnswer.points}`,
            );

            // check if all online players have answered
            const isAllAnswered =
                await this.lobbyService.isAllOnlinePlayersAnswerCurrentQuestion(
                    { lobbyId: lobby.id, questionId },
                );

            if (isAllAnswered) {
                return this.handleEndRound({ pin, questionId });
            }

            // emit new answer event so host can update answer count
            this.socketService.emitToRoom(lobby.id.toString(), "newAnswer", {
                optionId,
            });

            return { success: true };
        } catch (error) {
            this.logger.debug(error);
            return { success: false };
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("timeUp")
    async handleTimeUp(
        @MessageBody() body: { pin: string; questionId: number },
    ) {
        const { pin, questionId } = body;

        return this.handleEndRound({ pin, questionId });
    }

    async handleEndRound(params: { pin: string; questionId: number }) {
        const { pin, questionId } = params;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        const { answer } =
            await this.lobbyService.findAnswerToQuestion(questionId);

        // [TO-DO]: The stats should be returned from here

        this.socketService.emitToRoom(lobby.id.toString(), "showResult", {
            optionId: answer.id,
        });

        return { success: true };
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("nextQuestion")
    async handleNextQuestion(@MessageBody() payload: { pin: string }) {
        const { pin } = payload;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        // increase current question index
        const updated = await this.lobbyService.increaseCurrentQuestionIndex(
            lobby.id,
        );

        // check if there's no questions
        const questions = await this.lobbyService.getQuestionListOfLobby(
            lobby.id,
        );

        if (updated.currentQuestionIndex >= questions.length) {
            const leaderboard = await this.lobbyService.getLeaderBoard(
                lobby.id,
            );

            this.socketService.emitToRoom(lobby.id.toString(), "gameFinished", {
                leaderboard,
            });

            await this.lobbyService.updateLobbyStatus(
                lobby.id,
                LobbyStatus.CLOSED,
            );

            return { success: true };
        }

        // get current question
        this.socketService.emitToRoom(updated.id.toString(), "newQuestion", {
            currentQuestionIndex: updated.currentQuestionIndex,
            currentQuestion: questions[updated.currentQuestionIndex],
            totalQuestions: questions.length,
        });

        return { success: true };
    }
}
