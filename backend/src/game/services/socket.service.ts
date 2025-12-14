import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class SocketService {
    public server: Server;

    setServer(server: Server) {
        this.server = server;
    }

    emitToRoom({
        roomId,
        event,
        payload,
    }: {
        roomId: string;
        event: string;
        payload?: any;
    }) {
        this.server.to(roomId).emit(event, payload);
    }
}
