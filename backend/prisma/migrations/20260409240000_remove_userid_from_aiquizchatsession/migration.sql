/*
  Warnings:

  - You are about to drop the column `userId` on the `AiQuizChatSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[quizId]` on the table `AiQuizChatSession` will be added. If there are existing duplicate values, this will fail.
*/

-- DropForeignKey
ALTER TABLE "AiQuizChatSession" DROP CONSTRAINT "AiQuizChatSession_userId_fkey";

-- DropIndex
DROP INDEX "AiQuizChatSession_userId_idx";

-- DropIndex
DROP INDEX "AiQuizChatSession_quizId_userId_key";

-- AlterTable
ALTER TABLE "AiQuizChatSession" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "AiQuizChatSession_quizId_key" ON "AiQuizChatSession"("quizId");

