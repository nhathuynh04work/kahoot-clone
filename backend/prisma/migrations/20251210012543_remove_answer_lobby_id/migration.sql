/*
  Warnings:

  - You are about to drop the column `lobbyId` on the `PlayerAnswer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerAnswer" DROP CONSTRAINT "PlayerAnswer_lobbyId_fkey";

-- AlterTable
ALTER TABLE "PlayerAnswer" DROP COLUMN "lobbyId";
