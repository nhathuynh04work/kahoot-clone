-- Enable pgvector extension (required: install pgvector first; see backend/docs/PGVECTOR_SETUP.md)
CREATE EXTENSION IF NOT EXISTS vector;

-- Convert embedding column from double precision[] to vector(768) for similarity search
ALTER TABLE "DocumentChunk"
  ALTER COLUMN "embedding" TYPE vector(768)
  USING (('[' || array_to_string(embedding, ',') || ']')::vector(768));
