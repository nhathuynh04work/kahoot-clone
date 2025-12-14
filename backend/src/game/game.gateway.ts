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
import { Logger, UseGuards } from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";
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

            this.socketService.emitToRoom(lobbyId, "hostLeft");

            await this.lobbyService.closeLobby(lobbyId);

            return;
        }

        this.logger.log(`Player ${nickname} left lobby ${lobbyId}.`);

        this.socketService.emitToRoom(lobbyId, "playerLeft", { nickname });
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
        client.data.nickname = nickname;

        await client.join(`${player.lobbyId}`);

        this.socketService.emitToRoom(
            player.lobbyId.toString(),
            "playerJoined",
            { player },
        );

        return { success: true };
    }
}
