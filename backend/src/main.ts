import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    app.enableCors();

    // Pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Cookie parser
    app.use(cookieParser());

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
