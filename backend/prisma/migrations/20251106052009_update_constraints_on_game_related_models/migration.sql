/*
  Warnings:

  - You are about to alter the column `pin` on the `GameLobby` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(6)`.
  - A unique constraint covering the columns `[activeHostQuizKey]` on the table `GameLobby` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lobbyId,nickname]` on the table `GamePlayer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[question_id,sort_order]` on the table `Option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quiz_id,sort_order]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."GameLobby_pin_key";

-- AlterTable
ALTER TABLE "GameLobby" ADD COLUMN     "activeHostQuizKey" TEXT,
ALTER COLUMN "pin" SET DATA TYPE CHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "GameLobby_activeHostQuizKey_key" ON "GameLobby"("activeHostQuizKey");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_lobbyId_nickname_key" ON "GamePlayer"("lobbyId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Option_question_id_sort_order_key" ON "Option"("question_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "Question_quiz_id_sort_order_key" ON "Question"("quiz_id", "sort_order");
