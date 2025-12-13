import { LobbyService } from "./services/lobby.service";
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, UseGuards } from "@nestjs/common";
import { JwtWsGuard } from "../auth/guard/jwt-ws.guard";
import { type JwtUser, User } from "../auth/user.decorator";

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger("GameGateway");

    constructor(private lobbyService: LobbyService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {}

    @UseGuards(JwtWsGuard)
    @SubscribeMessage("createLobby")
    async handleCreateLobby(
        @User() user: JwtUser,
        @MessageBody() payload: { quizId: number },
    ) {
        const { quizId } = payload;
        const hostId = user.id;

        const lobby = await this.lobbyService.createLobby({ quizId, hostId });
        return { lobby };
    }
}
