-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "embedding" vector(768) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentChunk_document_id_idx" ON "DocumentChunk"("document_id");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
