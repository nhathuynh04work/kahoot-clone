import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export type JwtUser = {
    id: number;
    email: string;
};

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtUser => {
        const contextType = ctx.getType();

        if (contextType === "http") {
            const request = ctx.switchToHttp().getRequest();
            return request.user as JwtUser;
        }

        if (contextType === "ws") {
            const client: Socket = ctx.switchToWs().getClient<Socket>();
            return client["user"] as JwtUser;
        }

        throw new Error(`Unsupported context type: ${contextType}.`);
    },
);
