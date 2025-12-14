import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { LobbyService } from "./services/lobby.service";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard";
import { User, type JwtUser } from "../auth/user.decorator";

@Controller("game")
export class GameController {
    constructor(private lobbyService: LobbyService) {}

    @Get("lobby")
    async getActiveLobby(@Query("pin") pin: string) {
        const lobby = await this.lobbyService.findActiveLobby({ pin });

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
}
