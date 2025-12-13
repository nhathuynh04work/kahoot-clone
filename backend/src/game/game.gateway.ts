import { LobbyService } from "./services/lobby.service";
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
import { Inject, Logger, UseGuards } from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";
import Redis from "ioredis";

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger("GameGateway");

    constructor(
        private lobbyService: LobbyService,
        @Inject("REDIS_CLIENT") private redis: Redis,
    ) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {}

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("createLobby")
    async handleCreateLobby(
        @User() user: JwtUser,
        @MessageBody() payload: { quizId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const { quizId } = payload;
        const hostId = user.id;

        const lobby = await this.lobbyService.createLobby({ quizId, hostId });

        // [TO-DO]: Save host and lobbyId to redis,
        // the app needs to keep track of the host socket id with the lobby id
        // so that it can destroy the lobby when the host disconnects
        await this.redis.set(
            `${client.id}`,
            JSON.stringify({ isHost: true, lobbyId: lobby.id }),
        );

        return { lobby };
    }
}
