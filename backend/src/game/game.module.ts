import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway.js";
import { GameService } from "./game.service.js";
import { QuizModule } from "../quiz/quiz.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { GameController } from "./game.controller.js";
import { QuestionModule } from "../question/question.module.js";
import { LobbyService } from "./services/lobby.service.js";
import { GameSessionService } from "./services/game-session.service.js";
import { SocketModule } from "../socket/socket.module.js";

@Module({
    imports: [QuizModule, AuthModule, QuestionModule, SocketModule],
    providers: [GameGateway, GameService, LobbyService, GameSessionService],
    controllers: [GameController],
})
export class GameModule {}
