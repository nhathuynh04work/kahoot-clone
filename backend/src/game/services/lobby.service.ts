import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { LobbyStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LobbyService {
    private logger = new Logger(LobbyService.name);

    constructor(private prisma: PrismaService) {}

    async findActiveLobbyByPin(pin: string) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                pin: pin,
                status: { in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS] },
            },
            include: { quiz: true },
        });

        if (!lobby) {
            throw new NotFoundException(`Lobby with PIN ${pin} not found`);
        }

        return lobby;
    }

    async findLobbyById(lobbyId: number) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: {
                id: lobbyId,
            },
            include: { quiz: true },
        });

        if (!lobby) {
            throw new NotFoundException(`Lobby not found`);
        }

        return lobby;
    }

    async updateLobbyStatus(lobbyId: number, status: LobbyStatus) {
        const updated = await this.prisma.gameLobby.update({
            where: { id: lobbyId },
            data: { status },
        });

        return updated;
    }

    private async getUniquePin() {
        let pin = "000000";
        let isPinInUse = true;

        while (isPinInUse) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const lobby = await this.prisma.gameLobby.findFirst({
                where: {
                    pin: pin,
                    status: {
                        in: [LobbyStatus.WAITING, LobbyStatus.IN_PROGRESS],
                    },
                },
            });

            if (!lobby) isPinInUse = false;
        }

        return pin;
    }

    async createLobby(params: { quizId: number; hostId: number }) {
        const { quizId, hostId } = params;

        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { _count: { select: { questions: true } } },
        });

        if (!quiz || quiz?._count.questions < 1) {
            throw new BadRequestException("Quiz not valid to start new game.");
        }

        const pin = await this.getUniquePin();
        const newLobby = this.prisma.gameLobby.create({
            data: { pin, quizId, hostId },
        });

        return newLobby;
    }

    async addPlayerToLobby(params: { pin: string; nickname: string }) {
        const { pin, nickname } = params;

        const lobby = await this.findActiveLobbyByPin(pin);

        const player = await this.prisma.gamePlayer.create({
            data: {
                nickname,
                lobbyId: lobby.id,
            },
        });

        return player;
    }
}
