import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { JwtUser } from "../user.decorator.js";
import * as cookie from "cookie";

@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>();

        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader)
            throw new WsException("Unauthorized: No auth header");

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.access_token;

        if (!token) throw new WsException("Unauthorized: No cookie provided");

        try {
            const user = await this.jwtService.verifyAsync(token);
            client["user"] = { id: user.sub, email: user.email };

            return true;
        } catch (error) {
            throw new WsException("Unauthorized: Invalid or expired token");
        }
    }
}
