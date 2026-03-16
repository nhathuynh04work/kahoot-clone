-- DropIndex
DROP INDEX "DocumentChunk_embedding_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "cloudinaryPublicId" TEXT;
