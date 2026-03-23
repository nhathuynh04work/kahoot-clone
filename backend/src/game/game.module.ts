import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { QuizModule } from "../quiz/quiz.module";
import { AuthModule } from "../auth/auth.module";
import { GameController } from "./game.controller";
import { LobbyService } from "./services/lobby.service";
import { SocketService } from "./services/socket.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [QuizModule, AuthModule, UserModule],
    providers: [GameGateway, GameService, LobbyService, SocketService],
    controllers: [GameController],
})
export class GameModule {}
