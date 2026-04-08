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
import { OptionalJwtHttpGuard } from "../auth/guard/optional-jwt-http.guard";
import { User, type JwtUser } from "../auth/user.decorator";

@Controller("game")
export class GameController {
    private logger = new Logger(GameController.name);

    constructor(private lobbyService: LobbyService) {}

    @Get("report/quiz/:quizId")
    @UseGuards(OptionalJwtHttpGuard)
    async getSessionsForQuiz(
        @User() user: JwtUser | null,
        @Param("quizId", ParseIntPipe) quizId: number,
    ) {
        return this.lobbyService.getSessionsForQuiz(quizId, user?.id);
    }

    @Get("report")
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

    @Get("report/page")
    @UseGuards(JwtHttpGuard)
    async getReportPage(
        @User() user: JwtUser,
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("quizId") quizId?: string,
        @Query("q") q?: string,
        @Query("sort")
        sort?:
            | "endedAt_desc"
            | "endedAt_asc"
            | "players_desc"
            | "players_asc"
            | "accuracy_desc"
            | "accuracy_asc",
    ) {
        return this.lobbyService.getReportPageForHost(user.id, {
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
            quizId: quizId ? parseInt(quizId, 10) : undefined,
            q,
            sort,
        });
    }

    @Get("report/:lobbyId")
    @UseGuards(OptionalJwtHttpGuard)
    async getSessionReport(
        @User() user: JwtUser | null,
        @Param("lobbyId", ParseIntPipe) lobbyId: number,
    ) {
        return this.lobbyService.getSessionReport(lobbyId, user?.id);
    }

    @Get("lobby")
    async getActiveLobby(@Query("pin") pin: string) {
        const lobby = await this.lobbyService.findActiveLobbyByPin(pin);

        return lobby;
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
