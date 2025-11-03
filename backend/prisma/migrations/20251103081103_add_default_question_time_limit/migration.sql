/*
  Warnings:

  - Made the column `time_limit` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "time_limit" SET NOT NULL,
ALTER COLUMN "time_limit" SET DEFAULT 2000;
