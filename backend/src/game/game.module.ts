import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { QuizModule } from "../quiz/quiz.module";
import { AuthModule } from "../auth/auth.module";
import { GameController } from "./game.controller";
import { QuestionModule } from "../question/question.module";
import { LobbyService } from "./services/lobby.service";

@Module({
    imports: [QuizModule, AuthModule, QuestionModule],
    providers: [GameGateway, GameService, LobbyService],
    controllers: [GameController],
})
export class GameModule {}
