-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "text" TEXT,
    "time_limit" INTEGER NOT NULL DEFAULT 2000,
    "points" INTEGER NOT NULL DEFAULT 1,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "text" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobby" (
    "id" SERIAL NOT NULL,
    "pin" CHAR(6) NOT NULL,
    "quizId" INTEGER NOT NULL,
    "hostId" INTEGER NOT NULL,
    "hostSocketId" TEXT,
    "status" "LobbyStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeHostQuizKey" TEXT,

    CONSTRAINT "GameLobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "socketId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "lobbyId" INTEGER NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Question_quiz_id_sort_order_key" ON "Question"("quiz_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "Option_question_id_sort_order_key" ON "Option"("question_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobby_activeHostQuizKey_key" ON "GameLobby"("activeHostQuizKey");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_socketId_key" ON "GamePlayer"("socketId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_lobbyId_nickname_key" ON "GamePlayer"("lobbyId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAnswer_playerId_questionId_key" ON "PlayerAnswer"("playerId", "questionId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
