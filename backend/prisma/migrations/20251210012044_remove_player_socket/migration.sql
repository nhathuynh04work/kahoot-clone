/*
  Warnings:

  - You are about to drop the column `socketId` on the `GamePlayer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GamePlayer_socketId_key";

-- AlterTable
ALTER TABLE "GamePlayer" DROP COLUMN "socketId";
