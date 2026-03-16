-- AlterTable
ALTER TABLE "AiQuizChatMessage" ADD COLUMN     "generatedCount" INTEGER,
ADD COLUMN     "generatedQuestions" JSONB;
