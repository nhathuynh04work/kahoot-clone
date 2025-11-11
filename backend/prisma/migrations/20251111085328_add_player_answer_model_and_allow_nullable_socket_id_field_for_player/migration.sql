-- AlterTable
ALTER TABLE "GamePlayer" ALTER COLUMN "socketId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PlayerAnswer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "scoreEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAnswer_playerId_questionId_key" ON "PlayerAnswer"("playerId", "questionId");

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
