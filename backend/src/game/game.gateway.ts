import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
    BadRequestException,
    Logger,
    NotFoundException,
    UseGuards,
} from "@nestjs/common";
import { QuizService } from "../quiz/quiz.service.js";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { GameService } from "./game.service.js";
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({
    cors: {
        origin: "http://localhost:3001",
        credentials: true,
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger("GameGateway");

    constructor(
        private gameService: GameService,
        private quizService: QuizService,
    ) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // 1. Check if it was a Player
        try {
            const disconnectedPlayer = await this.gameService.disconnectPlayer(
                client.id,
            );

            if (disconnectedPlayer) {
                this.server.to(disconnectedPlayer.pin).emit("playerLeft", {
                    id: disconnectedPlayer.playerId,
                    nickname: disconnectedPlayer.nickname,
                });
                return; // Exit if it was a player
            }
        } catch (error) {
            this.logger.error(
                `Error handling player disconnect for socket ${client.id}`,
                error,
            );
        }

        // 2. Check if it was a Host (Wait 60s for reconnect)
        setTimeout(() => {
            void (async () => {
                try {
                    const closedLobbyPin =
                        await this.gameService.closeStaleLobby(client.id);

                    if (closedLobbyPin) {
                        this.server.to(closedLobbyPin).emit("lobbyClosed");
                    }
                } catch (error) {
                    this.logger.error(
                        `Error closing stale lobby for socket ${client.id}`,
                        error,
                    );
                }
            })();
        }, 60000);
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("createLobby")
    async handleCreateLobby(
        @User() user: JwtUser,
        @MessageBody() payload: { quizId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            await this.quizService.getQuiz(payload.quizId, user.id);

            const pin = await this.gameService.createLobby({
                quizId: payload.quizId,
                hostId: user.id,
                socketId: client.id,
            });

            client.join(pin);

            this.logger.log(
                `Host ${user.email} (ID: ${user.id}) created/joined room ${pin}`,
            );

            return { success: true, pin };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage("joinLobby")
    async handleJoinLobby(
        @MessageBody() payload: { pin: string; nickname: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { pin, nickname } = payload;

        try {
            const newPlayer = await this.gameService.addPlayerToLobby({
                pin,
                nickname,
                socketId: client.id,
            });

            client.join(pin);

            this.logger.log(
                `Player ${nickname} (Socket: ${client.id}) joined room ${pin}`,
            );

            this.server.to(pin).emit("playerJoined", {
                id: newPlayer.id,
                nickname: newPlayer.nickname,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response.message || "Failed to join lobby.",
            };
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("startGame")
    async handleStartGame(
        @User() user: JwtUser,
        @MessageBody() payload: { pin: string },
    ) {
        const { pin } = payload;

        try {
            const roundData = await this.gameService.startGame(pin, user.id);

            this.logger.log(roundData);

            if (!roundData) {
                return { success: false, error: "Quiz has no questions" };
            }

            this.logger.log(`Host: ${user.email} start game for lobby ${pin}`);
            this.server.to(pin).emit("newQuestion", roundData);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("nextQuestion")
    async handleNextQuestion(
        @User() user: JwtUser,
        @MessageBody() payload: { pin: string },
    ) {
        const { pin } = payload;

        try {
            const roundData = await this.gameService.nextQuestion(pin, user.id);

            if (!roundData) {
                this.logger.log(`Game finished for lobby ${pin}`);
                this.server.to(pin).emit("gameOver");
                return { success: true };
            }

            this.logger.log(`Host: ${user.email} start game for lobby ${pin}`);
            this.server.to(pin).emit("newQuestion", roundData);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage("submitAnswer")
    async handleSubmitAnswer(
        @MessageBody()
        payload: { pin: string; questionId: number; optionId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const { pin, optionId, questionId } = payload;

        try {
            const { answerCount } =
                await this.gameService.submitAnswerAndCheckCompletion({
                    socketId: client.id,
                    questionId,
                    optionId,
                });

            this.logger.log(`Player ${client.id} submitted their answer`);
            this.server.to(pin).emit("updateAnswerCount", {
                count: answerCount,
            });

            return { success: true };
        } catch (error) {
            this.logger.error(
                `Answer submission failed for ${client.id}: ${error.message}`,
            );
            return {
                success: false,
                message: error.message || "Failed to submit answer.",
            };
        }
    }

    @OnEvent("game.questionTimeUp")
    handleQuestionTimeUp(payload: {
        pin: string;
        lobbyId: number;
        correctOptionId: number;
        stats: Record<number, number>;
    }) {
        this.logger.log(`Time up event received for lobby ${payload.pin}`);
        this.server.to(payload.pin).emit("questionTimeUp", {
            correctOptionId: payload.correctOptionId,
            stats: payload.stats,
        });
    }
}
