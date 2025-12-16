/*
  Warnings:

  - You are about to drop the column `score` on the `GamePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `scoreEarned` on the `PlayerAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GamePlayer" DROP COLUMN "score",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayerAnswer" DROP COLUMN "scoreEarned",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;
