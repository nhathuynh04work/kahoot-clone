-- Rename question type NUMERIC_RANGE -> NUMBER_INPUT
-- and backfill NUMBER_INPUT data defaults.

DO $$
BEGIN
  -- Prisma may have already applied enum changes in some environments.
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'QuestionType' AND e.enumlabel = 'NUMERIC_RANGE'
  ) THEN
    ALTER TYPE "QuestionType" RENAME VALUE 'NUMERIC_RANGE' TO 'NUMBER_INPUT';
  END IF;
END $$;

-- Backfill data JSON for NUMBER_INPUT (previously NUMERIC_RANGE)
UPDATE "Question"
SET "data" =
  jsonb_set(
    jsonb_set(
      jsonb_set(
        "data"::jsonb,
        '{allowRange}',
        'true'::jsonb,
        true
      ),
      '{step}',
      '1'::jsonb,
      true
    ),
    '{rangeInclusive}',
    COALESCE(("data"::jsonb->'rangeInclusive'), 'true'::jsonb),
    true
  )
WHERE "type" = 'NUMBER_INPUT'
  AND (
    NOT ("data"::jsonb ? 'allowRange')
    OR NOT ("data"::jsonb ? 'step')
  );

