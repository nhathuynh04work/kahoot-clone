import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class SocketService {
    private readonly logger = new Logger(SocketService.name);
    private readonly TTL = 86400; // 24 hours

    constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

    /**
     * Binds an abstract identity (string) to a socket ID.
     * @param clientKey - The unique key for the client (e.g., "user:1", "player:500")
     * @param socketId - The socket ID from Socket.IO
     */
    async register(clientKey: string, socketId: string): Promise<void> {
        const socketKey = `socket:${socketId}`;

        await Promise.all([
            // Map Identity -> Socket
            this.redis.set(clientKey, socketId, "EX", this.TTL),
            // Map Socket -> Identity (Reverse lookup for disconnects)
            this.redis.set(socketKey, clientKey, "EX", this.TTL),
        ]);

        this.logger.debug(`Mapped ${clientKey} <-> ${socketId}`);
    }

    async getSocketId(clientKey: string): Promise<string | null> {
        return await this.redis.get(clientKey);
    }

    /**
     * Retrieves the clientKey associated with a socket.
     * Use this on disconnect to find out WHO disconnected.
     */
    async getClientKey(socketId: string): Promise<string | null> {
        return await this.redis.get(`socket:${socketId}`);
    }

    async remove(clientKey: string, socketId: string): Promise<void> {
        await Promise.all([
            this.redis.del(clientKey),
            this.redis.del(`socket:${socketId}`),
        ]);
        this.logger.debug(`Removed connection for ${clientKey}`);
    }
}
