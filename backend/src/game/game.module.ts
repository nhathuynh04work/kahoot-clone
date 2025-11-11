import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway.js";
import { GameService } from "./game.service.js";
import { QuizModule } from "../quiz/quiz.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { GameController } from "./game.controller.js";
import { QuestionModule } from "../question/question.module.js";

@Module({
    imports: [QuizModule, AuthModule, QuestionModule],
    providers: [GameGateway, GameService],
    controllers: [GameController],
})
export class GameModule {}
