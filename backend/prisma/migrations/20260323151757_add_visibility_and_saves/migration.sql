-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "QuizSave" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSave" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizSave_quizId_idx" ON "QuizSave"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSave_userId_quizId_key" ON "QuizSave"("userId", "quizId");

-- CreateIndex
CREATE INDEX "DocumentSave_documentId_idx" ON "DocumentSave"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSave_userId_documentId_key" ON "DocumentSave"("userId", "documentId");

-- AddForeignKey
ALTER TABLE "QuizSave" ADD CONSTRAINT "QuizSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSave" ADD CONSTRAINT "QuizSave_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSave" ADD CONSTRAINT "DocumentSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSave" ADD CONSTRAINT "DocumentSave_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
