import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import * as cookie from "cookie";
import { UserService } from "../../user/user.service.js";

@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private jwtService: JwtService, private userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>();

        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader)
            throw new WsException("Unauthorized: No auth header");

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.access_token;

        if (!token) throw new WsException("Unauthorized: No cookie provided");

        try {
            const jwtUser = await this.jwtService.verifyAsync(token);
            const user = await this.userService.getUserWithRole({ id: jwtUser.sub });

            if (!user || (user as any).isBlocked) {
                throw new WsException("Unauthorized: Account blocked");
            }

            client["user"] = { id: user.id, email: user.email };

            return true;
        } catch (error) {
            throw new WsException("Unauthorized: Invalid or expired token");
        }
    }
}
