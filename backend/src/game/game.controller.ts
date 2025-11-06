import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { GameService } from "./game.service.js";

@Controller("game")
export class GameController {
    constructor(private gameService: GameService) {}

    @Get("validate-pin")
    validatePin(@Query("pin") pin: string) {
        if (!pin) throw new BadRequestException("A Game PIN must be provided.");

        return this.gameService.getValidLobby(pin);
    }
}
