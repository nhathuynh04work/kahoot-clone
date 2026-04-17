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
    Logger,
    NotFoundException,
    UseGuards,
} from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";
import { SocketService } from "./services/socket.service";
import { LobbyStatus } from "../generated/prisma/client";
import { QuestionWithOptions } from "../quiz/dto/quiz.dto";

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
    ) {}

    afterInit(server: Server) {
        this.socketService.setServer(server);
        this.logger.log("SocketService initialized with server instance");
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        const { isHost, lobbyId, nickname, hostId } = client.data || {};

        if (!lobbyId) {
            this.logger.log(`Client disconnected: ${client.id}`);
            return;
        }

        if (isHost) {
            // Close all active lobbies for this host to avoid orphans from duplicate requests.
            const hostNumericId = Number(hostId);
            if (Number.isFinite(hostNumericId) && hostNumericId > 0) {
                const closedLobbyIds =
                    await this.lobbyService.closeActiveLobbiesForHost(hostNumericId);
                for (const id of closedLobbyIds) {
                    this.socketService.emitToRoom(id.toString(), "hostLeft");
                }
                this.logger.log(
                    `Host disconnected. Closed lobbies: ${closedLobbyIds.join(", ") || "(none)"}`,
                );
                return;
            }

            this.logger.log(`Host disconnected. Destroying lobby ${lobbyId}`);
            this.socketService.emitToRoom(lobbyId.toString(), "hostLeft");
            await this.lobbyService.closeLobbyWithoutReport(lobbyId);

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
    @SubscribeMessage("hostCreateLobby")
    async handleHostCreateLobby(
        @User() user: JwtUser,
        @MessageBody() payload: { quizId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const quizId = Number(payload?.quizId);

        try {
            if (client.data.isCreatingLobby) {
                return { success: false, message: "Lobby creation in progress" };
            }
            client.data.isCreatingLobby = true;

            const lobby = await this.lobbyService.createLobby({
                quizId,
                hostId: user.id,
            });

            client.data.isHost = true;
            client.data.lobbyId = lobby.id;
            client.data.hostId = user.id;

            await this.lobbyService.updateLobbyStatus(
                lobby.id,
                LobbyStatus.WAITING,
            );

            await client.join(`${lobby.id}`);
            this.logger.log(`Host created & joined lobby ${lobby.id}`);

            return { success: true, lobbyId: lobby.id, pin: lobby.pin };
        } catch (error) {
            this.logger.error(error?.message ?? error);
            return {
                success: false,
                message:
                    typeof error?.message === "string"
                        ? error.message
                        : "Could not create lobby",
            };
        } finally {
            client.data.isCreatingLobby = false;
        }
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

                await this.lobbyService.updatePlayerOnlineStatus({
                    nickname,
                    lobbyId: player.lobbyId,
                    isOnline: true,
                });

                this.logger.log(
                    `Player ${nickname} (socketID: ${client.id}) has rejoined`,
                );

                return { success: true };
            }

            if (await this.lobbyService.isPlayerOnline(lobby.id, nickname))
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
            this.logger.error(error.message);
            return { success: false };
        } finally {
            client.data.isJoining = false;
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("startGame")
    async handleStartGame(
        @User() user: JwtUser,
        @MessageBody() payload: { pin: string },
    ) {
        const { pin } = payload;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        // Only the lobby host can start the game (private or public).
        if (lobby.hostId !== user.id) {
            return { success: false, message: "Only the host can start this game." };
        }

        // Cannot start a lobby that has already started
        if (lobby.status === LobbyStatus.IN_PROGRESS) {
            return { success: false };
        }

        // Update status
        await this.lobbyService.updateLobbyStatus(lobby.id, LobbyStatus.IN_PROGRESS);

        // Get the question
        const questions = await this.lobbyService.getQuestionList(lobby.quizId, {
            includeAnswer: false,
        });

        const currentQuestionIndex = await this.lobbyService.getCurrentQuestionIndex(
            lobby.id,
        );

        await this.lobbyService.initializeAnswerStatsForQuestion(
            lobby.id,
            questions[currentQuestionIndex] as QuestionWithOptions,
        );

        this.socketService.emitToRoom(lobby.id.toString(), "newQuestion", {
            currentQuestionIndex: currentQuestionIndex,
            currentQuestion: questions[currentQuestionIndex],
            totalQuestions: questions.length,
        });

        return { success: true };
    }

    // [TO-DO]: Create a service that encapsulates all step, return the points and isCorrect to frontend
    @SubscribeMessage("submitAnswer")
    async handleSubmitAnswer(
        @MessageBody()
        body: {
            mcSelectedIndex?: number;
            textAnswer?: string;
            numericAnswer?: number;
            questionId: number;
            nickname: string;
            pin: string;
        },
    ) {
        const { mcSelectedIndex, textAnswer, numericAnswer, questionId, nickname, pin } =
            body;

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

            const result = await this.lobbyService.gradeAnswer({
                quizId: lobby.quizId,
                questionId,
                mcSelectedIndex,
                textAnswer,
                numericAnswer,
            });

            const savedAnswer = await this.lobbyService.saveAnswer({
                mcSelectedIndex: mcSelectedIndex ?? null,
                textAnswer: textAnswer ?? null,
                numericAnswer: numericAnswer ?? null,
                questionId,
                playerId: player.id,
                isCorrect: result.isCorrect,
                points: result.points,
            });

            await this.lobbyService.addScoreToLeaderboard(
                lobby.id,
                nickname,
                result.points,
            );

            this.logger.log(
                `Player ${nickname} submitted their answer. It's ${savedAnswer.isCorrect ? "correct" : "incorrect"}. Points earned: ${savedAnswer.points}`,
            );

            await this.lobbyService.recordAnswerStats({
                lobbyId: lobby.id,
                questionId,
                mcSelectedIndex: mcSelectedIndex ?? null,
                textAnswer: textAnswer ?? null,
                numericAnswer: numericAnswer ?? null,
                shortAnswerCaseSensitive:
                    (result as { shortAnswerCaseSensitive?: boolean })
						.shortAnswerCaseSensitive ?? undefined,
            });

            await this.lobbyService.markPlayerAsAnswered({
                lobbyId: lobby.id,
                questionId,
                nickname,
            });

            const isAllAnswered =
                await this.lobbyService.isAllOnlinePlayersAnswerCurrentQuestion(
                    { lobbyId: lobby.id, questionId },
                );

            if (isAllAnswered) {
                return this.handleEndRound({ pin, questionId });
            }

            this.socketService.emitToRoom(lobby.id.toString(), "newAnswer", {
                mcSelectedIndex: mcSelectedIndex ?? null,
                textAnswer: textAnswer ?? null,
                numericAnswer: numericAnswer ?? null,
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

        const reveal = await this.lobbyService.getQuestionRevealForResult(
            lobby.quizId,
            questionId,
        );

        const stats = await this.lobbyService.getQuestionStats(
            lobby.id,
            questionId,
        );

        const indices = reveal.correctOptionIndices;
        this.socketService.emitToRoom(lobby.id.toString(), "showResult", {
            ...reveal,
            correctOptionIndices: indices,
            correctOptionIndex:
                Array.isArray(indices) && indices.length === 1 ? indices[0] : undefined,
            answerStats: stats,
        });

        return { success: true };
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("nextQuestion")
    async handleNextQuestion(@MessageBody() payload: { pin: string }) {
        const { pin } = payload;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        // increase current question index
        const nextIndex = await this.lobbyService.increaseCurrentQuestionIndex(
            lobby.id,
        );

        // check if there's no questions
        const questions = await this.lobbyService.getQuestionList(lobby.quizId);

        if (nextIndex >= questions.length) {
            const leaderboard = await this.lobbyService.getLeaderBoard(
                lobby.id,
            );

            this.socketService.emitToRoom(lobby.id.toString(), "gameFinished", {
                leaderboard,
            });

            await this.lobbyService.persistCompletedLobbyReport(lobby.id);

            return { success: true };
        }

        await this.lobbyService.initializeAnswerStatsForQuestion(
            lobby.id,
            questions[nextIndex] as QuestionWithOptions,
        );

        // get current question
        this.socketService.emitToRoom(lobby.id.toString(), "newQuestion", {
            currentQuestionIndex: nextIndex,
            currentQuestion: questions[nextIndex],
            totalQuestions: questions.length,
        });

        return { success: true };
    }
}
