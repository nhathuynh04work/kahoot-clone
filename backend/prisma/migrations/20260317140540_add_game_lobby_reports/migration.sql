-- CreateEnum
CREATE TYPE "LobbyEndReason" AS ENUM ('COMPLETED', 'HOST_DISCONNECT');

-- AlterTable
ALTER TABLE "GameLobby" ADD COLUMN     "endReason" "LobbyEndReason",
ADD COLUMN     "endedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GameLobbyReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "totalAnswers" INTEGER NOT NULL,
    "totalCorrect" INTEGER NOT NULL,
    "totalIncorrect" INTEGER NOT NULL,
    "avgAccuracy" DOUBLE PRECISION NOT NULL,
    "leaderboardJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLobbyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobbyQuestionReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "sortIndex" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "correctRate" DOUBLE PRECISION NOT NULL,
    "optionCountsJson" JSONB NOT NULL,

    CONSTRAINT "GameLobbyQuestionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobbyPlayerReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "answeredCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "finalScore" INTEGER NOT NULL,

    CONSTRAINT "GameLobbyPlayerReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyReport_lobbyId_key" ON "GameLobbyReport"("lobbyId");

-- CreateIndex
CREATE INDEX "GameLobbyReport_lobbyId_idx" ON "GameLobbyReport"("lobbyId");

-- CreateIndex
CREATE INDEX "GameLobbyQuestionReport_lobbyId_idx" ON "GameLobbyQuestionReport"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyQuestionReport_reportId_questionId_key" ON "GameLobbyQuestionReport"("reportId", "questionId");

-- CreateIndex
CREATE INDEX "GameLobbyPlayerReport_lobbyId_idx" ON "GameLobbyPlayerReport"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyPlayerReport_reportId_playerId_key" ON "GameLobbyPlayerReport"("reportId", "playerId");

-- AddForeignKey
ALTER TABLE "GameLobbyReport" ADD CONSTRAINT "GameLobbyReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyQuestionReport" ADD CONSTRAINT "GameLobbyQuestionReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GameLobbyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyQuestionReport" ADD CONSTRAINT "GameLobbyQuestionReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GameLobbyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
