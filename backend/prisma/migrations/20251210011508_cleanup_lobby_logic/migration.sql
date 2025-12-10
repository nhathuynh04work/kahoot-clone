/*
  Warnings:
  - You are about to drop the column `activeHostQuizKey` on the `GameLobby` table.
  - You are about to drop the column `hostSocketId` on the `GameLobby` table.
*/

-- 1. Drop the columns
ALTER TABLE "GameLobby" DROP COLUMN "activeHostQuizKey";
ALTER TABLE "GameLobby" DROP COLUMN "hostSocketId";

-- 2. Create the Partial Index for Data Integrity
-- This ensures a Host can only have ONE active lobby for a specific Quiz at a time.
CREATE UNIQUE INDEX "GameLobby_hostId_quizId_active_key" 
ON "GameLobby"("hostId", "quizId") 
WHERE "status" IN ('WAITING', 'IN_PROGRESS');