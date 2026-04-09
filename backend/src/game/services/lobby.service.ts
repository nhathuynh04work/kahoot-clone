import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    ForbiddenException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {
    GameLobby,
    LobbyStatus,
    Prisma,
    Question,
    QuestionType,
} from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import Redis from "ioredis";
import { QuestionWithOptions } from "../../quiz/dto/quiz.dto";
import {
    attachClientOptions,
    getMcCorrectIndicesForGrading,
    parseQuestionData,
    sortMcOptions,
    stripQuestionForPlay,
} from "../../quiz/question-payload";
import type { MultipleChoiceData, ShortAnswerData } from "../../quiz/question-payload";
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

    async closeLobbyWithoutReport(lobbyId: number) {
        const lobby = await this.prisma.gameLobby.findUnique({
            where: { id: lobbyId },
        });

        if (!lobby) {
            throw new NotFoundException(`Lobby ${lobbyId} not found`);
        }

        await this.prisma.gameLobby.update({
            where: { id: lobbyId },
            data: {
                status: LobbyStatus.CLOSED,
                endedAt: new Date(),
            },
        });

        await this.redis.del(lobbyPinKey(lobby.pin));
        await this.redis.del(lobbyCurrentQuestionIndexKey(lobbyId));
    }

    async persistCompletedLobbyReport(lobbyId: number) {
        const existingReport = await this.prisma.gameLobbyReport.findUnique({
            where: { lobbyId },
        });
        if (existingReport) {
            this.logger.debug(`Lobby ${lobbyId} already has a report, skipping`);
            await this.updateLobbyStatus(lobbyId, LobbyStatus.CLOSED);
            return;
        }

        const lobby = await this.prisma.gameLobby.findUnique({
            where: { id: lobbyId },
            include: {
                quiz: { include: { questions: { orderBy: { sortOrder: "asc" } } } },
                players: { include: { answers: true } },
            },
        });

        if (!lobby) {
            throw new NotFoundException(`Lobby ${lobbyId} not found`);
        }

        const questions = lobby.quiz.questions.sort(
            (a, b) => a.sortOrder - b.sortOrder,
        );
        const totalQuestions = questions.length;
        const totalPlayers = lobby.players.length;

        const totalAnswers = lobby.players.reduce(
            (sum, p) => sum + p.answers.length,
            0,
        );
        const totalCorrect = lobby.players.reduce(
            (sum, p) => sum + p.answers.filter((a) => a.isCorrect).length,
            0,
        );
        const totalIncorrect = totalAnswers - totalCorrect;
        const avgAccuracy =
            totalAnswers > 0 ? totalCorrect / totalAnswers : 0;

        const leaderboard = lobby.players
            .map((p) => ({ nickname: p.nickname, points: p.points }))
            .sort((a, b) => b.points - a.points);

        const questionReports = questions.map((q, sortIndex) => {
            const answersForQuestion = lobby.players.flatMap((p) =>
                p.answers.filter((a) => a.questionId === q.id),
            );
            const correctCount = answersForQuestion.filter(
                (a) => a.isCorrect,
            ).length;
            const incorrectCount = answersForQuestion.length - correctCount;
            const correctRate =
                answersForQuestion.length > 0
                    ? correctCount / answersForQuestion.length
                    : 0;

            let breakdownJson: Prisma.JsonObject | undefined;
            if (
                q.type === QuestionType.MULTIPLE_CHOICE ||
                q.type === QuestionType.TRUE_FALSE
            ) {
                const optionCounts: Record<string, number> = {};

                if (q.type === QuestionType.MULTIPLE_CHOICE) {
                    const mc = parseQuestionData(q.type, q.data) as MultipleChoiceData;
                    const n = sortMcOptions(mc.options).length;
                    for (let i = 0; i < n; i++) {
                        optionCounts[i.toString()] = 0;
                    }
                } else {
                    // TRUE_FALSE
                    optionCounts["0"] = 0;
                    optionCounts["1"] = 0;
                }

                for (const a of answersForQuestion) {
                    if (a.mcSelectedIndex != null) {
                        const key = a.mcSelectedIndex.toString();
                        optionCounts[key] = (optionCounts[key] ?? 0) + 1;
                    }
                }

                breakdownJson = {
                    kind: "choice",
                    optionCounts,
                } as unknown as Prisma.JsonObject;
            } else if (q.type === QuestionType.SHORT_ANSWER) {
                const counts: Record<string, number> = {};
                for (const a of answersForQuestion) {
                    const t = (a.textAnswer ?? "").trim().toLowerCase();
                    const k = t || "(empty)";
                    counts[k] = (counts[k] ?? 0) + 1;
                }
                breakdownJson = {
                    kind: "short_answer",
                    counts,
                } as unknown as Prisma.JsonObject;
            } else if (q.type === QuestionType.NUMBER_INPUT) {
                const values = answersForQuestion
                    .map((a) =>
                        a.numericAnswer != null ? Number(a.numericAnswer) : null,
                    )
                    .filter((n): n is number => n != null && Number.isFinite(n));
                breakdownJson = {
                    kind: "number_input",
                    values,
                } as unknown as Prisma.JsonObject;
            }

            return {
                questionId: q.id,
                sortIndex,
                correctCount,
                incorrectCount,
                correctRate,
                breakdownJson,
            };
        });

        await this.prisma.$transaction(async (tx) => {
            await tx.gameLobby.update({
                where: { id: lobbyId },
                data: {
                    status: LobbyStatus.CLOSED,
                    endedAt: new Date(),
                },
            });

            const report = await tx.gameLobbyReport.create({
                data: {
                    lobbyId,
                    totalPlayers,
                    totalQuestions,
                    totalAnswers,
                    totalCorrect,
                    totalIncorrect,
                    avgAccuracy,
                    leaderboardJson: leaderboard as unknown as Prisma.JsonArray,
                },
            });

            await tx.gameLobbyQuestionReport.createMany({
                data: questionReports.map((qr) => ({
                    ...qr,
                    reportId: report.id,
                })),
            });
        });

        await this.redis.del(lobbyPinKey(lobby.pin));
        await this.redis.del(lobbyCurrentQuestionIndexKey(lobbyId));

        this.logger.log(`Persisted report for lobby ${lobbyId}`);
    }

    async getRecentSessionsForHost(
        hostId: number,
        options: { limit?: number; cursor?: number } = {},
    ) {
        const { limit = 20, cursor } = options;

        const lobbies = await this.prisma.gameLobby.findMany({
            where: {
                hostId,
                status: LobbyStatus.CLOSED,
                report: { isNot: null },
            },
            include: {
                quiz: { select: { id: true, title: true } },
                report: true,
            },
            orderBy: { endedAt: "desc" },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasMore = lobbies.length > limit;
        const items = hasMore ? lobbies.slice(0, limit) : lobbies;
        const nextCursor = hasMore ? items[items.length - 1]?.id : null;

        return {
            items: items.map((l) => ({
                lobbyId: l.id,
                quizId: l.quizId,
                quizTitle: l.quiz?.title ?? "Untitled",
                createdAt: l.createdAt,
                endedAt: l.endedAt,
                totalPlayers: l.report?.totalPlayers ?? 0,
                avgAccuracy: l.report?.avgAccuracy ?? 0,
            })),
            nextCursor,
        };
    }

    async getReportPageForHost(
        hostId: number,
        options: {
            page: number;
            pageSize: number;
            quizId?: number;
            q?: string;
            sort?:
                | "endedAt_desc"
                | "endedAt_asc"
                | "players_desc"
                | "players_asc"
                | "accuracy_desc"
                | "accuracy_asc";
        },
    ) {
        const page = Number.isFinite(options.page) ? Math.max(1, options.page) : 1;
        const pageSize = Number.isFinite(options.pageSize)
            ? Math.min(100, Math.max(1, options.pageSize))
            : 20;

        const q = options.q?.trim() ? options.q.trim() : undefined;
        const where: Prisma.GameLobbyWhereInput = {
            hostId,
            status: LobbyStatus.CLOSED,
            report: { isNot: null },
            ...(options.quizId ? { quizId: options.quizId } : {}),
            ...(q
                ? {
                      quiz: {
                          title: {
                              contains: q,
                              mode: "insensitive",
                          },
                      },
                  }
                : {}),
        };

        const stableTies: Prisma.GameLobbyOrderByWithRelationInput[] = [
            { endedAt: "desc" },
            { id: "desc" },
        ];

        const sort = options.sort ?? "endedAt_desc";
        const orderBy: Prisma.GameLobbyOrderByWithRelationInput[] = (() => {
            switch (sort) {
                case "endedAt_asc":
                    return [{ endedAt: "asc" }, { id: "asc" }];
                case "endedAt_desc":
                    return stableTies;
                case "players_asc":
                    return [{ report: { totalPlayers: "asc" } }, ...stableTies];
                case "players_desc":
                    return [{ report: { totalPlayers: "desc" } }, ...stableTies];
                case "accuracy_asc":
                    return [{ report: { avgAccuracy: "asc" } }, ...stableTies];
                case "accuracy_desc":
                    return [{ report: { avgAccuracy: "desc" } }, ...stableTies];
                default:
                    return stableTies;
            }
        })();

        const totalItems = await this.prisma.gameLobby.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        const lobbies = await this.prisma.gameLobby.findMany({
            where,
            include: {
                quiz: { select: { id: true, title: true } },
                report: true,
            },
            orderBy,
            skip,
            take: pageSize,
        });

        return {
            items: lobbies.map((l) => ({
                lobbyId: l.id,
                quizId: l.quizId,
                quizTitle: l.quiz?.title ?? "Untitled",
                createdAt: l.createdAt,
                endedAt: l.endedAt,
                totalPlayers: l.report?.totalPlayers ?? 0,
                avgAccuracy: l.report?.avgAccuracy ?? 0,
            })),
            page: safePage,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async getSessionReport(lobbyId: number, viewerId?: number) {
        const lobby = await this.prisma.gameLobby.findFirst({
            where: { id: lobbyId },
            include: {
                quiz: { include: { questions: { orderBy: { sortOrder: "asc" } } } },
                players: { include: { answers: true } },
                report: {
                    include: {
                        questionReports: { orderBy: { sortIndex: "asc" } },
                    },
                },
            },
        });

        if (!lobby || !lobby.report) {
            throw new NotFoundException(`Session report not found`);
        }

        // Private quizzes: only the quiz owner can access session report details.
        if (lobby.quiz.visibility === "PRIVATE" && viewerId !== lobby.quiz.userId) {
            throw new ForbiddenException(
                "Not allowed to see this session report",
            );
        }

        const leaderboard = lobby.report.leaderboardJson as {
            nickname: string;
            points: number;
        }[];

        return {
            session: {
                lobbyId: lobby.id,
                quizId: lobby.quizId,
                quizTitle: lobby.quiz?.title ?? "Untitled",
                hostId: lobby.hostId,
                createdAt: lobby.createdAt,
                endedAt: lobby.endedAt,
            },
            aggregates: {
                totalPlayers: lobby.report.totalPlayers,
                totalQuestions: lobby.report.totalQuestions,
                totalAnswers: lobby.report.totalAnswers,
                totalCorrect: lobby.report.totalCorrect,
                totalIncorrect: lobby.report.totalIncorrect,
                avgAccuracy: lobby.report.avgAccuracy,
            },
            questions: lobby.report.questionReports.map((qr) => ({
                questionId: qr.questionId,
                sortIndex: qr.sortIndex,
                correctCount: qr.correctCount,
                incorrectCount: qr.incorrectCount,
                correctRate: qr.correctRate,
                breakdown: qr.breakdownJson as Record<string, unknown> | null,
                question: (() => {
                    const raw = lobby.quiz.questions.find((qq) => qq.id === qr.questionId);
                    return raw ? attachClientOptions(raw) : undefined;
                })(),
            })),
            players: lobby.players.map((p) => {
                const answeredCount = p.answers.length;
                const correctCount = p.answers.filter((a) => a.isCorrect).length;
                const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;

                return {
                    playerId: p.id,
                    nickname: p.nickname,
                    answeredCount,
                    correctCount,
                    accuracy,
                    finalScore: p.points,
                };
            }),
            leaderboard,
        };
    }

    async getSessionsForQuiz(quizId: number, viewerId?: number) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, userId: true, visibility: true },
        });

        if (!quiz) {
            throw new NotFoundException("Quiz not found");
        }

        if (quiz.visibility === "PRIVATE" && viewerId !== quiz.userId) {
            throw new ForbiddenException(
                "Not allowed to see sessions for this quiz",
            );
        }

        const lobbies = await this.prisma.gameLobby.findMany({
            where: {
                quizId,
                status: LobbyStatus.CLOSED,
                report: { isNot: null },
            },
            include: { report: true },
            orderBy: { endedAt: "desc" },
            take: 50,
        });

        return lobbies.map((l) => ({
            lobbyId: l.id,
            quizId: l.quizId,
            createdAt: l.createdAt,
            endedAt: l.endedAt,
            totalPlayers: l.report?.totalPlayers ?? 0,
            avgAccuracy: l.report?.avgAccuracy ?? 0,
        }));
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

        // Prevent hosting private quizzes unless the requester is the owner.
        if (quiz.visibility === "PRIVATE" && quiz.userId !== hostId) {
            throw new ForbiddenException("Cannot start a private quiz.");
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

        let rawQuestions: Question[];

        if (cachedData) {
            rawQuestions = JSON.parse(cachedData) as Question[];
        } else {
            const quizData = await this.prisma.quiz.findUnique({
                where: { id: quizId },
                include: { questions: { orderBy: { sortOrder: "asc" } } },
            });

            if (!quizData) {
                throw new NotFoundException("Quiz not found");
            }

            rawQuestions = quizData.questions;

            await this.redis.set(
                cacheKey,
                JSON.stringify(rawQuestions),
                "EX",
                7200,
            );
        }

        if (includeAnswer) {
            return rawQuestions.map((q) => attachClientOptions(q));
        }

        return rawQuestions.map((q) => stripQuestionForPlay(q));
    }

    async getQuestionRevealForResult(quizId: number, questionId: number) {
        const q = await this.prisma.question.findFirst({
            where: { id: questionId, quizId },
        });
        if (!q) {
            throw new NotFoundException("Question not found");
        }
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
            const mc = parseQuestionData(q.type, q.data) as MultipleChoiceData;
            const sorted = sortMcOptions(mc.options);
            if (sorted.length === 0) {
                throw new NotFoundException("This question has no options set");
            }
            const indices = [...new Set(mc.correctIndices)]
                .filter((i) => i >= 0 && i < sorted.length)
                .sort((a, b) => a - b);
            if (indices.length === 0) {
                throw new NotFoundException(
                    "This question has no valid correct option indices",
                );
            }
            return {
                questionType: QuestionType.MULTIPLE_CHOICE,
                correctOptionIndices: indices,
            };
        }
        if (q.type === QuestionType.TRUE_FALSE) {
            const indices = getMcCorrectIndicesForGrading(q.type, q.data);
            if (!indices?.length) {
                throw new NotFoundException("True/false question has no correct side set");
            }
            return {
                questionType: QuestionType.TRUE_FALSE,
                correctOptionIndices: indices,
            };
        }
        if (q.type === QuestionType.SHORT_ANSWER) {
            const sa = parseQuestionData(q.type, q.data) as ShortAnswerData;
            return {
                questionType: QuestionType.SHORT_ANSWER,
                correctText: sa.correctText ?? "",
                caseSensitive: sa.caseSensitive === true,
            };
        }
        const ni = parseQuestionData(q.type, q.data) as {
            allowRange: boolean;
            correctNumber?: number;
            rangeProximity?: number;
        };
        if (ni.allowRange === true) {
            return {
                questionType: QuestionType.NUMBER_INPUT,
                allowRange: true,
                correctNumber: ni.correctNumber ?? 0,
                rangeProximity: ni.rangeProximity ?? 0,
            };
        }
        return {
            questionType: QuestionType.NUMBER_INPUT,
            allowRange: false,
            correctNumber: ni.correctNumber ?? 0,
        };
    }

    async gradeAnswer(params: {
        quizId: number;
        questionId: number;
        mcSelectedIndex?: number;
        textAnswer?: string;
        numericAnswer?: number;
    }) {
        const { quizId, questionId, mcSelectedIndex, textAnswer, numericAnswer } =
            params;

        const question = await this.prisma.question.findFirst({
            where: { id: questionId, quizId },
        });
        if (!question) {
            throw new NotFoundException("Question not found");
        }

        if (
            question.type === QuestionType.MULTIPLE_CHOICE ||
            question.type === QuestionType.TRUE_FALSE
        ) {
            if (mcSelectedIndex == null || !Number.isFinite(mcSelectedIndex)) {
                throw new BadRequestException("mcSelectedIndex is required");
            }
            const correct = getMcCorrectIndicesForGrading(question.type, question.data);
            if (!correct?.length) {
                throw new NotFoundException("This question has no correct options set");
            }
            const nOptions =
                question.type === QuestionType.TRUE_FALSE
                    ? 2
                    : sortMcOptions(
                          (parseQuestionData(question.type, question.data) as MultipleChoiceData)
                              .options,
                      ).length;
            const idx = Math.floor(mcSelectedIndex);
            const isCorrect =
                idx >= 0 && idx < nOptions && correct.includes(idx);
            return { isCorrect, points: isCorrect ? question.points : 0 };
        }

        if (question.type === QuestionType.SHORT_ANSWER) {
            const sa = parseQuestionData(question.type, question.data) as ShortAnswerData;
            const got = (textAnswer ?? "").trim();
            const expected = (sa.correctText ?? "").trim();
            if (!got.length) {
                return { isCorrect: false, points: 0 };
            }
            const isCorrect =
                sa.caseSensitive === true
                    ? got === expected
                    : got.toLowerCase() === expected.toLowerCase();
            return { isCorrect, points: isCorrect ? question.points : 0 };
        }

        if (question.type === QuestionType.NUMBER_INPUT) {
            if (numericAnswer == null || !Number.isFinite(numericAnswer)) {
                return { isCorrect: false, points: 0 };
            }
            const ni = parseQuestionData(question.type, question.data) as {
                allowRange: boolean;
                correctNumber?: number;
                rangeProximity?: number;
            };
            const n = numericAnswer;
            const isCorrect =
                ni.allowRange === true
                    ? (() => {
                          if (
                              typeof ni.correctNumber === "number" &&
                              Number.isFinite(ni.correctNumber) &&
                              typeof ni.rangeProximity === "number" &&
                              Number.isFinite(ni.rangeProximity) &&
                              ni.rangeProximity >= 0
                          ) {
                              const min = ni.correctNumber - ni.rangeProximity;
                              const max = ni.correctNumber + ni.rangeProximity;
                              return n >= min && n <= max;
                          }
                          return false;
                      })()
                    : n === (ni.correctNumber ?? 0);
            return { isCorrect, points: isCorrect ? question.points : 0 };
        }

        throw new NotFoundException("Unsupported question type");
    }

    async saveAnswer(params: {
        mcSelectedIndex: number | null;
        textAnswer?: string | null;
        numericAnswer?: number | null;
        questionId: number;
        playerId: number;
        isCorrect: boolean;
        points: number;
    }) {
        const saved = await this.prisma.playerAnswer.create({
            data: {
                playerId: params.playerId,
                questionId: params.questionId,
                mcSelectedIndex: params.mcSelectedIndex,
                textAnswer: params.textAnswer ?? null,
                numericAnswer:
                    params.numericAnswer != null && Number.isFinite(params.numericAnswer)
                        ? params.numericAnswer
                        : null,
                isCorrect: params.isCorrect,
                points: params.points,
            },
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

    private truncateStatField(s: string, maxLen: number) {
        if (s.length <= maxLen) return s;
        return s.slice(0, maxLen);
    }

    async recordAnswerStats(params: {
        lobbyId: number;
        questionId: number;
        mcSelectedIndex?: number | null;
        textAnswer?: string | null;
        numericAnswer?: number | null;
    }) {
        const { lobbyId, questionId, mcSelectedIndex, textAnswer, numericAnswer } =
            params;
        const key = questionStatsKey(lobbyId, questionId);

        if (mcSelectedIndex != null) {
            await this.redis.hincrby(key, mcSelectedIndex.toString(), 1);
        } else if (textAnswer != null) {
            const field = this.truncateStatField(
                textAnswer.trim().toLowerCase() || "(empty)",
                200,
            );
            await this.redis.hincrby(key, field, 1);
        } else if (numericAnswer != null && Number.isFinite(numericAnswer)) {
            await this.redis.hincrby(key, String(numericAnswer), 1);
        }

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

    async initializeAnswerStatsForQuestion(
        lobbyId: number,
        question: QuestionWithOptions,
    ) {
        const key = questionStatsKey(lobbyId, question.id);
        await this.redis.del(key);

        let n = 0;
        if (question.type === QuestionType.MULTIPLE_CHOICE) {
            const mc = parseQuestionData(question.type, question.data) as MultipleChoiceData;
            n = sortMcOptions(mc.options).length;
        } else if (question.type === QuestionType.TRUE_FALSE) {
            n = 2;
        } else {
            await this.redis.expire(key, 7200);
            return;
        }

        const pipeline = this.redis.pipeline();
        for (let i = 0; i < n; i++) {
            pipeline.hset(key, i.toString(), "0");
        }
        pipeline.expire(key, 7200);
        await pipeline.exec();
    }
}
