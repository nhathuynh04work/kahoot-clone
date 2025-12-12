import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { QuestionService } from "../../question/question.service.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { LobbyStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class GameSessionService {
    private readonly logger = new Logger(GameSessionService.name);
    private readonly lobbyTimers = new Map<number, NodeJS.Timeout>();

    constructor(
        private prisma: PrismaService,
        private questionService: QuestionService,
        private eventEmitter: EventEmitter2,
    ) {}

    async startGame(pin: string, hostId: number) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { pin, hostId, status: LobbyStatus.WAITING },
        });

        if (!lobby) {
            throw new NotFoundException("Cannot find waiting lobby to start");
        }

        await this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: { currentQuestionIndex: 0 },
        });

        return this.playCurrentQuestion(lobby.pin);
    }

    async nextQuestion(pin: string, hostId: number) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { pin, hostId, status: LobbyStatus.IN_PROGRESS },
        });

        if (!lobby) {
            throw new NotFoundException("Cannot find active lobby");
        }

        await this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: { currentQuestionIndex: { increment: 1 } },
        });

        return this.playCurrentQuestion(lobby.pin);
    }

    async endLobby(pin: string, hostId: number) {
        await this.prisma.gameLobby.updateMany({
            where: {
                pin,
                hostId,
                status: LobbyStatus.IN_PROGRESS,
            },
            data: {
                status: LobbyStatus.FINISHED,
            },
        });

        // Clean up timer if exists
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { pin },
            select: { id: true },
        });
        if (lobby && this.lobbyTimers.has(lobby.id)) {
            clearTimeout(this.lobbyTimers.get(lobby.id));
            this.lobbyTimers.delete(lobby.id);
        }
    }

    private async playCurrentQuestion(pin: string) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { pin },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { sortOrder: "asc" },
                            include: { options: { omit: { isCorrect: true } } },
                        },
                    },
                },
            },
        });

        if (!lobby) throw new NotFoundException("Lobby not found");

        const questionIndex = lobby.currentQuestionIndex;
        const question = lobby.quiz.questions[questionIndex];

        // End of game check
        if (!question) {
            return null;
        }

        // Ensure status is IN_PROGRESS
        await this.prisma.gameLobby.update({
            where: { id: lobby.id },
            data: { status: LobbyStatus.IN_PROGRESS },
        });

        // Timer Logic
        if (this.lobbyTimers.has(lobby.id)) {
            clearTimeout(this.lobbyTimers.get(lobby.id));
        }

        const timeLimit = question.timeLimit || 20000;
        const endsAt = Date.now() + timeLimit;

        const timer = setTimeout(() => {
            void (async () => {
                try {
                    const results = await this.getQuestionResults(
                        lobby.id,
                        question.id,
                    );

                    this.eventEmitter.emit("game.questionTimeUp", {
                        pin,
                        lobbyId: lobby.id,
                        ...results,
                    });
                } catch (error) {
                    this.logger.error(`Timer error for lobby ${pin}: ${error}`);
                }
            })();
        }, timeLimit);

        this.lobbyTimers.set(lobby.id, timer);

        return {
            question,
            questionIndex,
            totalQuestions: lobby.quiz.questions.length,
            timeLimit,
            endsAt,
        };
    }

    /**
     * Submit answer and return current stats.
     * @param playerId - The ID of the player answering
     * @param activePlayerCount - Number of currently connected players (to check for early finish)
     */
    async submitAnswer(params: {
        playerId: number;
        questionId: number;
        optionId: number;
        activePlayerCount: number;
    }) {
        const { playerId, questionId, optionId, activePlayerCount } = params;

        const player = await this.prisma.gamePlayer.findUnique({
            where: { id: playerId },
            include: { lobby: true },
        });

        if (!player) throw new NotFoundException("Player not found");
        if (player.lobby.status !== LobbyStatus.IN_PROGRESS) {
            throw new Error("Lobby is not in progress.");
        }

        // 1. Calculate Score (Move logic here or keep delegation)
        const { isCorrect, points } = await this.questionService.gradeAnswer({
            questionId,
            optionId,
        });

        // 2. Save Answer & Update Score
        const [playerAnswer] = await this.prisma.$transaction([
            this.prisma.playerAnswer.create({
                data: {
                    playerId,
                    questionId,
                    optionId,
                    isCorrect,
                    scoreEarned: points,
                },
            }),
            this.prisma.gamePlayer.update({
                where: { id: playerId },
                data: { score: { increment: points } },
            }),
        ]);

        // 3. Check for Early Completion
        const answerCount = await this.getAnswerCountForQuestion(
            player.lobbyId,
            questionId,
        );

        if (activePlayerCount > 0 && answerCount >= activePlayerCount) {
            this.logger.log(
                `All ${activePlayerCount} players answered in lobby ${player.lobby.pin}. Ending question early.`,
            );

            // Clear timer and emit TimeUp immediately
            if (this.lobbyTimers.has(player.lobbyId)) {
                clearTimeout(this.lobbyTimers.get(player.lobbyId));
                this.lobbyTimers.delete(player.lobbyId);
            }

            const results = await this.getQuestionResults(
                player.lobbyId,
                questionId,
            );

            this.eventEmitter.emit("game.questionTimeUp", {
                pin: player.lobby.pin,
                lobbyId: player.lobbyId,
                ...results,
            });
        }

        return { answerCount };
    }

    async getLeaderboard(lobbyId: number) {
        return this.prisma.gamePlayer.findMany({
            where: { lobbyId },
            select: { id: true, nickname: true, score: true },
            orderBy: { score: "desc" },
        });
    }

    private async getQuestionResults(lobbyId: number, questionId: number) {
        const answerCounts = await this.prisma.playerAnswer.groupBy({
            by: ["optionId"],
            where: { questionId, player: { lobbyId } },
            _count: { _all: true },
        });

        const stats: Record<number, number> = {};
        answerCounts.forEach((item) => {
            stats[item.optionId] = item._count._all;
        });

        const correctOption = await this.prisma.option.findFirst({
            where: { questionId, isCorrect: true },
            select: { id: true },
        });

        return {
            correctOptionId: correctOption?.id,
            stats,
        };
    }

    private getAnswerCountForQuestion(lobbyId: number, questionId: number) {
        return this.prisma.playerAnswer.count({
            where: { questionId, player: { lobbyId } },
        });
    }
}
