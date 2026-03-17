-- CreateEnum
CREATE TYPE "AiChatRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "AiQuizChatSession" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" "AiChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "documentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiQuizChatSession_userId_idx" ON "AiQuizChatSession"("userId");

-- CreateIndex
CREATE INDEX "AiQuizChatSession_lastActivityAt_idx" ON "AiQuizChatSession"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiQuizChatSession_quizId_userId_key" ON "AiQuizChatSession"("quizId", "userId");

-- CreateIndex
CREATE INDEX "AiQuizChatMessage_sessionId_createdAt_idx" ON "AiQuizChatMessage"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatMessage" ADD CONSTRAINT "AiQuizChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiQuizChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatMessage" ADD CONSTRAINT "AiQuizChatMessage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
