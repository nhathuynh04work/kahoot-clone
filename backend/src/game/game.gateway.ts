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
import { LobbyStatus } from "../generated/prisma/enums.js";

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

    // Handle a new client connection
    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        // this.logger.log(`Count: ${this.server.engine.clientsCount}`);
    }

    // Handle a client disconnection
    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Player disconnected
        try {
            const disconnectedPlayer = await this.gameService.disconnectPlayer(
                client.id,
            );

            if (disconnectedPlayer) {
                this.server.to(disconnectedPlayer.pin).emit("playerLeft", {
                    id: disconnectedPlayer.playerId,
                    nickname: disconnectedPlayer.nickname,
                });
            }
        } catch (error) {
            this.logger.error(
                `Error handling player disconnect for socket ${client.id}`,
                error,
            );
        }

        // Host disconnected
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setTimeout(async () => {
            try {
                const closedLobbyPin = await this.gameService.closeStaleLobby(
                    client.id,
                );

                if (closedLobbyPin) {
                    this.server.to(closedLobbyPin).emit("lobbyClosed");
                }
            } catch (error) {
                this.logger.error(
                    `Error closing stale lobby for socket ${client.id}`,
                    error,
                );
            }
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
            // This will check ownership and existence
            await this.quizService.getQuiz(payload.quizId, user.id);

            const pin = await this.gameService.createLobby({
                quizId: payload.quizId,
                hostId: user.id,
                socketId: client.id,
            });

            client.join(pin);

            this.logger.log(
                `Host ${user.email} (ID: ${user.id}) created and joined room ${pin}`,
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
            // 1. Call the service to validate and create the player
            const newPlayer = await this.gameService.addPlayerToLobby({
                pin,
                nickname,
                socketId: client.id,
            });

            // 2. Join the socket to the room
            client.join(pin);

            this.logger.log(
                `Player ${nickname} (Socket: ${client.id}) joined room ${pin}`,
            );

            // 3. Broadcast to the room (especially the host)
            this.server.to(pin).emit("playerJoined", {
                id: newPlayer.id,
                nickname: newPlayer.nickname,
            });

            // 4. Send a successful acknowledgment back to the joining player
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message || "Failed to join lobby.",
            };
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("startGame")
    async handleStartGame(
        @User() user: JwtUser,
        @MessageBody() payload: { pin: string; quizId: number },
    ) {
        const { pin, quizId } = payload;

        try {
            const quiz = await this.quizService.getQuiz(quizId, user.id);

            if (!quiz) throw new NotFoundException("Quiz not found");

            if (quiz.questions.length < 1)
                throw new BadRequestException("Quiz has no question");

            await this.gameService.changeLobbyStatus({
                quizId,
                hostId: user.id,
                status: LobbyStatus.IN_PROGRESS,
            });

            this.logger.log(`Host: ${user.email} start game for lobby ${pin}`);
            this.server.to(pin).emit("newQuestion", quiz.questions[0]);

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
            const playerAnswer = await this.gameService.savePlayerAnswer({
                socketId: client.id,
                questionId,
                optionId,
            });

            const answerCount =
                await this.gameService.getAnswerCountForQuestion(
                    playerAnswer.lobbyId,
                    questionId,
                );

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
}
