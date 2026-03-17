import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { LobbyService } from "./services/lobby.service";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard";
import { User, type JwtUser } from "../auth/user.decorator";

@Controller("game")
export class GameController {
    private logger = new Logger(GameController.name);

    constructor(private lobbyService: LobbyService) {}

    @Get("history/quiz/:quizId")
    @UseGuards(JwtHttpGuard)
    async getSessionsForQuiz(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
    ) {
        return this.lobbyService.getSessionsForQuiz(quizId, user.id);
    }

    @Get("history/:lobbyId")
    @UseGuards(JwtHttpGuard)
    async getSessionReport(
        @User() user: JwtUser,
        @Param("lobbyId", ParseIntPipe) lobbyId: number,
    ) {
        return this.lobbyService.getSessionReport(lobbyId, user.id);
    }

    @Get("history")
    @UseGuards(JwtHttpGuard)
    async getRecentSessions(
        @User() user: JwtUser,
        @Query("limit") limit?: string,
        @Query("cursor") cursor?: string,
    ) {
        return this.lobbyService.getRecentSessionsForHost(user.id, {
            limit: limit ? parseInt(limit, 10) : 20,
            cursor: cursor ? parseInt(cursor, 10) : undefined,
        });
    }

    @Get("lobby")
    async getActiveLobby(@Query("pin") pin: string) {
        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        return lobby;
    }

    @Post("lobby")
    @UseGuards(JwtHttpGuard)
    async createLobby(@User() user: JwtUser, @Body() body: { quizId: number }) {
        return this.lobbyService.createLobby({
            quizId: body.quizId,
            hostId: user.id,
        });
    }

    @Post("player")
    async registerPlayer(@Body() body: { pin: string; nickname: string }) {
        const { pin, nickname } = body;

        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        const player = await this.lobbyService.addPlayerToLobby({
            lobbyId: lobby.id,
            nickname,
        });

        this.logger.log(
            `Player ${nickname} added to lobby PIN ${pin} (ID: ${lobby.id})`,
        );

        return player;
    }
}
