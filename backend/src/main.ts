import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { SocketIoAdapter } from "./socket-io.adapter.js";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const frontendUrl = configService.get<string>("FRONTEND_URL");

    // CORS
    app.enableCors({ origin: frontendUrl, credentials: true });

    // Websocket adapter
    app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

    // Pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Cookie parser
    app.use(cookieParser());

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
