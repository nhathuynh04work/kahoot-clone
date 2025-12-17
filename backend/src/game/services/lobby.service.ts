import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { LobbyStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import Redis from "ioredis";

@Injectable()
export class LobbyService {
    private logger = new Logger(LobbyService.name);

    constructor(
        private prisma: PrismaService,
        @Inject("REDIS_CLIENT") redis: Redis,
    ) {}

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

    async addPlayerToLobby(params: { lobbyId: number; nickname: string }) {
        const { lobbyId, nickname } = params;

        try {
            const player = await this.prisma.gamePlayer.create({
                data: {
                    nickname,
                    lobbyId,
                },
            });

            return player;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictException("Nickname is already taken");
            }

            throw error;
        }
    }

    async findPlayerInLobby(params: { nickname: string; lobbyId: number }) {
        const { lobbyId, nickname } = params;

        return this.prisma.gamePlayer.findFirst({
            where: { nickname, lobbyId },
        });
    }

    async updatePlayerOnlineStatus(params: {
        nickname: string;
        lobbyId: number;
        isOnline: boolean;
    }) {
        const { nickname, lobbyId, isOnline } = params;

        const player = await this.prisma.gamePlayer.update({
            where: { lobbyId_nickname: { lobbyId, nickname } },
            data: { isOnline },
        });

        return player;
    }

    async getQuestionListOfLobby(
        lobbyId: number,
        options: { includeAnswer: boolean } = { includeAnswer: true },
    ) {
        const { includeAnswer } = options;

        const lobby = await this.prisma.gameLobby.findUnique({
            where: { id: lobbyId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                options: { omit: { isCorrect: includeAnswer } },
                            },
                        },
                    },
                },
            },
        });

        if (!lobby) {
            throw new NotFoundException("Lobby not found");
        }

        return lobby.quiz.questions;
    }

    async findAnswerToQuestion(questionId: number) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { options: true },
        });

        if (!question) {
            throw new NotFoundException("Question not found");
        }

        const correctOption = question.options.find((o) => o.isCorrect);
        return { question, answer: correctOption! };
    }

    async gradeAnswer(params: { questionId: number; optionId: number }) {
        const { questionId, optionId } = params;

        const { question, answer: correctOption } =
            await this.findAnswerToQuestion(questionId);

        const isCorrect = correctOption.id === optionId;
        const points = isCorrect ? question.points : 0;

        return { isCorrect, points };
    }

    async saveAnswer(params: {
        optionId: number;
        questionId: number;
        playerId: number;
        isCorrect: boolean;
        points: number;
    }) {
        const saved = await this.prisma.playerAnswer.create({
            data: params,
        });

        await this.prisma.gamePlayer.update({
            where: { id: params.playerId },
            data: { points: { increment: params.points } },
        });

        return saved;
    }

    async isAllOnlinePlayersAnswerCurrentQuestion(params: {
        lobbyId: number;
        questionId: number;
    }) {
        const { lobbyId, questionId } = params;

        const onlinePlayersCount = await this.prisma.gamePlayer.count({
            where: { lobbyId, isOnline: true },
        });

        const answerCount = await this.prisma.playerAnswer.count({
            where: { questionId, player: { lobbyId } },
        });

        return onlinePlayersCount === answerCount;
    }

    async increaseCurrentQuestionIndex(lobbyId: number) {
        const updated = await this.prisma.gameLobby.update({
            where: { id: lobbyId },
            data: { currentQuestionIndex: { increment: 1 } },
        });

        return updated;
    }

    async getLeaderBoard(lobbyId: number) {
        const leaderboard = await this.prisma.gamePlayer.findMany({
            where: { lobbyId },
            orderBy: {
                points: "desc",
            },
        });

        return leaderboard;
    }
}
