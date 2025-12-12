import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class SocketManagerService {
    private readonly logger = new Logger(SocketManagerService.name);
    private readonly TTL = 86400;

    constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

    async registerConnection(userId: number, socketId: string): Promise<void> {
        const userKey = `user:${userId}:socket`;
        const socketKey = `socket:${socketId}:user`;

        await Promise.all([
            this.redis.set(userKey, socketId, "EX", this.TTL),
            this.redis.set(socketKey, userId.toString(), "EX", this.TTL),
        ]);

        this.logger.debug(`Mapped User ${userId} <-> Socket ${socketId}`);
    }

    async getSocketId(userId: number): Promise<string | null> {
        return await this.redis.get(`user:${userId}:socket`);
    }

    async getUserIdFromSocket(socketId: string): Promise<number | null> {
        const id = await this.redis.get(`socket:${socketId}:user`);
        return id ? parseInt(id, 10) : null;
    }

    async removeConnection(userId: number, socketId: string): Promise<void> {
        await Promise.all([
            this.redis.del(`user:${userId}:socket`),
            this.redis.del(`socket:${socketId}:user`),
        ]);
        this.logger.debug(`Removed connection for User ${userId}`);
    }
}
