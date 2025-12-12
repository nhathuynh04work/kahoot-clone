import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service.js";

@Module({
    providers: [SocketService],
    exports: [SocketService],
})
export class SocketModule {}
