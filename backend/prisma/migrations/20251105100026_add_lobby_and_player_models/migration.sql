-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "GameLobby" (
    "id" SERIAL NOT NULL,
    "pin" TEXT NOT NULL,
    "quizId" INTEGER NOT NULL,
    "hostId" INTEGER NOT NULL,
    "status" "LobbyStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "lobbyId" INTEGER NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameLobby_pin_key" ON "GameLobby"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_socketId_key" ON "GamePlayer"("socketId");

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
