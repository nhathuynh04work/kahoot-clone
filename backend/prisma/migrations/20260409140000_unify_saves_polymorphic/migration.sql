-- Unify QuizSave + DocumentSave into a polymorphic Save table.

-- 1) Enum for target type
DO $$
BEGIN
    CREATE TYPE "SaveTargetType" AS ENUM ('QUIZ', 'DOCUMENT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2) New table
CREATE TABLE IF NOT EXISTS "Save" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetType" "SaveTargetType" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Save_pkey" PRIMARY KEY ("id")
);

-- 3) FK to user (polymorphic targets cannot be FK'd)
DO $$
BEGIN
    ALTER TABLE "Save"
        ADD CONSTRAINT "Save_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4) Uniqueness + indexes
DO $$
BEGIN
    ALTER TABLE "Save"
        ADD CONSTRAINT "Save_userId_targetType_targetId_key"
        UNIQUE ("userId", "targetType", "targetId");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Save_targetType_targetId_idx" ON "Save"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Save_userId_targetType_createdAt_idx" ON "Save"("userId", "targetType", "createdAt");

-- 5) Backfill from legacy tables
INSERT INTO "Save" ("userId", "targetType", "targetId", "createdAt")
SELECT "userId", 'QUIZ'::"SaveTargetType", "quizId", "createdAt"
FROM "QuizSave"
ON CONFLICT ("userId", "targetType", "targetId") DO NOTHING;

INSERT INTO "Save" ("userId", "targetType", "targetId", "createdAt")
SELECT "userId", 'DOCUMENT'::"SaveTargetType", "documentId", "createdAt"
FROM "DocumentSave"
ON CONFLICT ("userId", "targetType", "targetId") DO NOTHING;

-- 6) Drop legacy tables (Prisma models removed)
DROP TABLE IF EXISTS "QuizSave";
DROP TABLE IF EXISTS "DocumentSave";

