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
import { LobbyStatus } from "../generated/prisma/client";

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

            await this.lobbyService.updateLobbyStatus(
                lobbyId,
                LobbyStatus.CLOSED,
            );

            return;
        }

        this.logger.log(`Player ${nickname} left lobby ${lobbyId}.`);

        this.socketService.emitToRoom(lobbyId, "playerLeft", { nickname });
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
        return { success: true };
    }

    @SubscribeMessage("playerJoin")
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
