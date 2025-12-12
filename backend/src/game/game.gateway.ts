import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, UseGuards } from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { LobbyService } from "./services/lobby.service.js";
import { GameSessionService } from "./services/game-session.service.js";
import { SocketService } from "../socket/socket.service.js";

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
        private lobbyService: LobbyService,
        private gameSession: GameSessionService,
        private socketManager: SocketService,
    ) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // 1. Identify who disconnected
        const clientKey = await this.socketManager.getClientKey(client.id);
        if (!clientKey) return;

        // 2. Route to appropriate handler
        if (clientKey.startsWith("player:")) {
            const playerId = parseInt(clientKey.split(":")[1], 10);
            await this.handlePlayerDisconnect(playerId, client.id);
        } else if (clientKey.startsWith("user:")) {
            const hostId = parseInt(clientKey.split(":")[1], 10);
            await this.handleHostDisconnect(hostId, client.id);
        }

        // 3. Cleanup Socket Map
        await this.socketManager.remove(clientKey, client.id);
    }

    private async handlePlayerDisconnect(playerId: number, socketId: string) {
        // We can move this logic to GameSessionService later if it gets complex
        // For now, we just notify the lobby
        /* Note: To notify the lobby, we'd need to look up the lobby ID for this player.
           In a full Redis architecture, we'd store `socket:{id}:lobby` as well.
           For now, we accept that the server might not emit "playerLeft" on hard disconnects
           until we add that lookup to SocketManager.
        */
    }

    private async handleHostDisconnect(hostId: number, socketId: string) {
        // Logic for closing stale lobbies is now delegated to a service or
        // handled via specific events/timeouts managed by GameSessionService.
        // We do NOT put setTimeouts here in the Controller/Gateway.
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("createLobby")
    async handleCreateLobby(
        @User() user: JwtUser,
        @MessageBody() payload: { quizId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const pin = await this.lobbyService.createLobby({
                quizId: payload.quizId,
                hostId: user.id,
            });

            // Register Host Identity
            await this.socketManager.register(`user:${user.id}`, client.id);
            client.join(pin);

            this.logger.log(`Host ${user.email} created lobby ${pin}`);
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
        try {
            // Note: You need to move addPlayerToLobby to LobbyService
            const newPlayer = await this.lobbyService.addPlayer({
                pin: payload.pin,
                nickname: payload.nickname,
            });

            // Register Player Identity
            await this.socketManager.register(
                `player:${newPlayer.id}`,
                client.id,
            );
            client.join(payload.pin);

            this.server.to(payload.pin).emit("playerJoined", {
                id: newPlayer.id,
                nickname: newPlayer.nickname,
            });

            return { success: true, playerId: newPlayer.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("startGame")
    async handleStartGame(
        @User() user: JwtUser,
        @MessageBody() payload: { pin: string },
    ) {
        try {
            const roundData = await this.gameSession.startGame(
                payload.pin,
                user.id,
            );

            if (!roundData) {
                return { success: false, error: "Quiz has no questions" };
            }

            this.server.to(payload.pin).emit("newQuestion", roundData);
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
        try {
            const roundData = await this.gameSession.nextQuestion(
                payload.pin,
                user.id,
            );

            if (!roundData) {
                // Game Over Logic
                await this.gameSession.endLobby(payload.pin, user.id);

                // Fetch Lobby ID to get leaderboard (You might want to optimize this fetch)
                const lobby = await this.lobbyService.getValidLobby(
                    payload.pin,
                );
                const leaderboard = await this.gameSession.getLeaderboard(
                    lobby.id,
                );

                this.server.to(payload.pin).emit("gameOver", { leaderboard });
                return { success: true };
            }

            this.server.to(payload.pin).emit("newQuestion", roundData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage("submitAnswer")
    async handleSubmitAnswer(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        payload: { pin: string; questionId: number; optionId: number },
    ) {
        try {
            // 1. Resolve Identity
            const clientKey = await this.socketManager.getClientKey(client.id);
            if (!clientKey || !clientKey.startsWith("player:")) {
                throw new WsException("Player not identified");
            }
            const playerId = parseInt(clientKey.split(":")[1], 10);

            // 2. Get active players count for early finish check
            // (We can use the socket room size as an approximation for now)
            const roomSize =
                this.server.sockets.adapter.rooms.get(payload.pin)?.size || 0;
            // Subtract 1 assuming Host is in the room
            const activePlayerCount = Math.max(0, roomSize - 1);

            // 3. Delegate to Service
            const result = await this.gameSession.submitAnswer({
                playerId,
                questionId: payload.questionId,
                optionId: payload.optionId,
                activePlayerCount,
            });

            // 4. Emit Updates
            this.server.to(payload.pin).emit("updateAnswerCount", {
                count: result.answerCount,
            });

            return { success: true };
        } catch (error) {
            this.logger.error(`Submit Answer Failed: ${error.message}`);
            return { success: false, message: error.message };
        }
    }
}
