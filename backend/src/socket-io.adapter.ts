import { INestApplicationContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";

export class SocketIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService,
    ) {
        super(app);
    }

    createIOServer(port: number, options?: any) {
        const frontendUrl = this.configService.get<string>("FRONTEND_URL");

        const corsOptions = {
            origin: frontendUrl,
            credentials: true,
        };

        const optionsWithCors = {
            ...options,
            corsOptions,
        };

        return super.createIOServer(port, optionsWithCors);
    }
}
