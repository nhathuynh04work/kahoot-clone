import { Controller, Get, Query } from "@nestjs/common";
import { LobbyService } from "./services/lobby.service";

@Controller("game")
export class GameController {
    constructor(private lobbyService: LobbyService) {}

    @Get("lobby")
    async getActiveLobby(@Query("pin") pin: string) {
        const lobby = await this.lobbyService.findActiveLobby({ pin });

        return lobby;
    }
}
