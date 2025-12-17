import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { GameLobby, LobbyStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import Redis from "ioredis";
import { QuestionWithOptions } from "../../quiz/dto/quiz.dto";
import {
    lobbyAnsweredKey,
    lobbyCurrentQuestionIndexKey,
    lobbyLeaderboardKey,
    lobbyOnlinePlayersKey,
    lobbyPinKey,
    questionStatsKey,
    quizQuestionsKey,
} from "../../lib/redis-key-factory";

@Injectable()
export class LobbyService {
    private logger = new Logger(LobbyService.name);

    constructor(
        private prisma: PrismaService,
        @Inject("REDIS_CLIENT") private redis: Redis,
    ) {}

    async findActiveLobbyByPin(pin: string) {
        const cacheKey = lobbyPinKey(pin);
        const cachedLobby = await this.redis.get(cacheKey);

        if (cachedLobby) {
            return JSON.parse(cachedLobby) as GameLobby;
        }

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

        await this.redis.set(cacheKey, JSON.stringify(lobby), "EX", 7200);

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

        await this.redis.del(lobbyPinKey(updated.pin));

        if (status === LobbyStatus.CLOSED) {
            await this.redis.del(lobbyCurrentQuestionIndexKey(lobbyId));
        }

        return updated;
    }

    private async getUniquePin() {
        let pin = "000000";

        while (true) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            try {
                await this.findActiveLobbyByPin(pin);
            } catch (error) {
                // If it throws NotFoundException, the PIN is free
                if (error instanceof NotFoundException) {
                    return pin;
                }
                // If it's another error (e.g. Redis down), stop the loop
                throw error;
            }
        }
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
        const newLobby = await this.prisma.gameLobby.create({
            data: { pin, quizId, hostId },
        });

        await this.redis.set(
            lobbyCurrentQuestionIndexKey(newLobby.id),
            0,
            "EX",
            10800,
        );

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

            await this.redis.zadd(lobbyLeaderboardKey(lobbyId), 0, nickname);
            await this.redis.expire(lobbyLeaderboardKey(lobbyId), 10800);

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

        if (isOnline) {
            await this.redis.sadd(lobbyOnlinePlayersKey(lobbyId), nickname);
            return;
        }

        await this.redis.srem(lobbyOnlinePlayersKey(lobbyId), nickname);
    }

    async getCurrentQuestionIndex(lobbyId: number) {
        const index = await this.redis.get(
            lobbyCurrentQuestionIndexKey(lobbyId),
        );
        return index ? parseInt(index, 10) : 0;
    }

    async increaseCurrentQuestionIndex(lobbyId: number) {
        const newIndex = await this.redis.incr(
            lobbyCurrentQuestionIndexKey(lobbyId),
        );
        return newIndex;
    }

    async getQuestionList(
        quizId: number,
        options: { includeAnswer: boolean } = { includeAnswer: true },
    ) {
        const { includeAnswer } = options;
        const cacheKey = quizQuestionsKey(quizId);
        const cachedData = await this.redis.get(cacheKey);

        let questions: QuestionWithOptions[];

        if (cachedData) {
            questions = JSON.parse(cachedData);
        } else {
            const quizData = await this.prisma.quiz.findUnique({
                where: { id: quizId },
                include: { questions: { include: { options: true } } },
            });

            if (!quizData) {
                throw new NotFoundException("Quiz not found");
            }

            questions = quizData.questions;

            await this.redis.set(
                cacheKey,
                JSON.stringify(questions),
                "EX",
                7200,
            );
        }

        if (includeAnswer) return questions;

        return questions.map((q) => ({
            ...q,
            options: q.options.map(({ isCorrect, ...rest }) => rest),
        }));
    }

    async findAnswerToQuestion(quizId: number, questionId: number) {
        const questions = (await this.getQuestionList(quizId, {
            includeAnswer: true,
        })) as QuestionWithOptions[];

        const question = questions.find((q) => q.id === questionId);

        if (!question) {
            throw new NotFoundException("Question not found");
        }

        const correctOption = question.options.find((o) => o.isCorrect);

        if (!correctOption) {
            throw new NotFoundException(
                "This question has no correct option set",
            );
        }

        return { question, answer: correctOption };
    }

    async gradeAnswer(params: {
        quizId: number;
        questionId: number;
        optionId: number;
    }) {
        const { quizId, questionId, optionId } = params;

        const { question, answer: correctOption } =
            await this.findAnswerToQuestion(quizId, questionId);

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

    async markPlayerAsAnswered(params: {
        lobbyId: number;
        questionId: number;
        nickname: string;
    }) {
        const { lobbyId, questionId, nickname } = params;
        const key = lobbyAnsweredKey(lobbyId, questionId);
        await this.redis.sadd(key, nickname);
        await this.redis.expire(key, 3600);
    }

    async recordAnswerStats(params: {
        lobbyId: number;
        questionId: number;
        optionId: number;
    }) {
        const { lobbyId, questionId, optionId } = params;
        const key = questionStatsKey(lobbyId, questionId);

        await this.redis.hincrby(key, optionId.toString(), 1);
        await this.redis.expire(key, 7200);
    }

    async addScoreToLeaderboard(
        lobbyId: number,
        nickname: string,
        points: number,
    ) {
        if (points > 0) {
            await this.redis.zincrby(
                lobbyLeaderboardKey(lobbyId),
                points,
                nickname,
            );
        }
    }

    async getQuestionStats(lobbyId: number, questionId: number) {
        return await this.redis.hgetall(questionStatsKey(lobbyId, questionId));
    }

    async isAllOnlinePlayersAnswerCurrentQuestion(params: {
        lobbyId: number;
        questionId: number;
    }) {
        const { lobbyId, questionId } = params;

        const onlineAndAnsweredCount = await this.redis.sintercard(
            2,
            lobbyOnlinePlayersKey(lobbyId),
            lobbyAnsweredKey(lobbyId, questionId),
        );

        const onlinePlayersCount = await this.redis.scard(
            lobbyOnlinePlayersKey(lobbyId),
        );

        return (
            onlinePlayersCount === 0 ||
            onlineAndAnsweredCount === onlinePlayersCount
        );
    }

    async getLeaderBoard(lobbyId: number) {
        const rawList = await this.redis.zrevrange(
            lobbyLeaderboardKey(lobbyId),
            0,
            -1,
            "WITHSCORES",
        );

        const leaderboard: { nickname: string; points: number }[] = [];

        for (let i = 0; i < rawList.length; i += 2) {
            leaderboard.push({
                nickname: rawList[i],
                points: parseInt(rawList[i + 1], 10),
            });
        }

        return leaderboard;
    }

    async isPlayerOnline(lobbyId: number, nickname: string) {
        return this.redis.sismember(lobbyOnlinePlayersKey(lobbyId), nickname);
    }
}
