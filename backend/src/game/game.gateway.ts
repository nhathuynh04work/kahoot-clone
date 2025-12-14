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
import { Inject, Logger, UseGuards } from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";
import Redis from "ioredis";
import { SocketService } from "./services/socket.service";

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
        const isHost = client.data?.isHost;
        const lobbyId = client.data.lobbyId;

        if (isHost) {
            this.logger.log(`Host disconnected. Destroying lobby ${lobbyId}`);

            await this.lobbyService.closeLobby(lobbyId);

            this.socketService.emitToRoom({
                roomId: lobbyId,
                event: "hostLeft",
            });
        }

        this.logger.log(`Player named ${client.data.nickname} left room.`);

        this.socketService.emitToRoom({
            roomId: lobbyId,
            event: "playerLeft",
        });
    }

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

        // Add metadata to the socket and join it to a room
        client.data.isHost = true;
        client.data.lobbyId = lobby.id;
        await client.join(`${lobby.id}`);

        return { lobby };
    }

    @SubscribeMessage("joinLobby")
    async handleJoinLobby(
        @MessageBody() payload: { pin: string; nickname: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { pin, nickname } = payload;

        const player = await this.lobbyService.addPlayerToLobby({
            pin,
            nickname,
        });

        client.data.isHost = false;
        client.data.lobbyId = player.lobbyId;
        await client.join(`${player.lobbyId}`);

        this.socketService.emitToRoom({
            roomId: player.lobbyId.toString(),
            event: "playerJoined",
            payload: { nickname },
        });

        return { success: true };
    }
}
