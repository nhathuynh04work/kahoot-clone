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
import { Logger, UseGuards } from "@nestjs/common";
import { QuizService } from "../quiz/quiz.service.js";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { GameService } from "./game.service.js";

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
    }

    // Handle a client disconnection
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
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

            const pin = await this.gameService.createLobby(
                payload.quizId,
                user.id,
            );

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
                message: error.message || "Failed to join lobby.",
            };
        }
    }
}
