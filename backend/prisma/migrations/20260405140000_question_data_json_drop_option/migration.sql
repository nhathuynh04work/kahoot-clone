-- Question payload JSON + drop Option table; PlayerAnswer uses mcSelectedIndex
-- Idempotent fragments for recovery if a previous apply partially completed.

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "data" JSONB;
ALTER TABLE "PlayerAnswer" ADD COLUMN IF NOT EXISTS "mcSelectedIndex" INTEGER;

-- SHORT_ANSWER
UPDATE "Question"
SET "data" = jsonb_build_object(
  'v', 1,
  'correctText', COALESCE(NULLIF(trim("correctText"), ''), '')
)
WHERE "type" = 'SHORT_ANSWER'
  AND "data" IS NULL;

-- NUMERIC_RANGE (only rows with bounds; others get fallback at end)
UPDATE "Question"
SET "data" = jsonb_build_object(
  'v', 1,
  'rangeMin', ("rangeMin")::float,
  'rangeMax', ("rangeMax")::float,
  'rangeInclusive', "rangeInclusive"
)
WHERE "type" = 'NUMERIC_RANGE'
  AND "rangeMin" IS NOT NULL
  AND "rangeMax" IS NOT NULL
  AND "data" IS NULL;

-- MULTIPLE_CHOICE with options
UPDATE "Question" q
SET "data" = jsonb_build_object(
  'v', 1,
  'options', opt_json.options_json,
  'correctIndex', COALESCE(ci.idx, 0)
)
FROM (
  SELECT
    o_agg."questionId" AS qid,
    jsonb_agg(
      jsonb_build_object('text', o_agg."text", 'sortOrder', o_agg."sortOrder")
      ORDER BY o_agg."sortOrder" ASC, o_agg.id ASC
    ) AS options_json
  FROM "Option" o_agg
  GROUP BY o_agg."questionId"
) opt_json
LEFT JOIN LATERAL (
  SELECT
    (
      SELECT COUNT(*)::int
      FROM "Option" ob
      WHERE ob."questionId" = fc."questionId"
        AND (
          ob."sortOrder" < fc."sortOrder"
          OR (ob."sortOrder" = fc."sortOrder" AND ob.id < fc.id)
        )
    ) AS idx
  FROM (
    SELECT DISTINCT ON (ox."questionId")
      ox."questionId", ox."sortOrder", ox.id
    FROM "Option" ox
    WHERE ox."isCorrect" = true
    ORDER BY ox."questionId", ox."sortOrder" ASC, ox.id ASC
  ) fc
  WHERE fc."questionId" = opt_json.qid
) ci ON true
WHERE q.id = opt_json.qid
  AND q.type = 'MULTIPLE_CHOICE'
  AND q."data" IS NULL;

-- MULTIPLE_CHOICE with no options
UPDATE "Question" q
SET "data" = jsonb_build_object('v', 1, 'options', '[]'::jsonb, 'correctIndex', 0)
WHERE q.type = 'MULTIPLE_CHOICE'
  AND q."data" IS NULL;

-- NUMERIC_RANGE missing bounds
UPDATE "Question" q
SET "data" = jsonb_build_object(
  'v', 1,
  'rangeMin', 0::float,
  'rangeMax', 0::float,
  'rangeInclusive', true
)
WHERE q.type = 'NUMERIC_RANGE'
  AND q."data" IS NULL;

-- Any remaining null
UPDATE "Question"
SET "data" = jsonb_build_object('v', 1, 'options', '[]'::jsonb, 'correctIndex', 0)
WHERE "data" IS NULL;

ALTER TABLE "Question" ALTER COLUMN "data" SET NOT NULL;

-- PlayerAnswer: map optionId -> 0-based index (only when Option table still exists)
UPDATE "PlayerAnswer" pa
SET "mcSelectedIndex" = sub.zero_idx
FROM (
  SELECT
    pa2.id AS pa_id,
    (
      SELECT COUNT(*)::int
      FROM "Option" o2
      WHERE o2."questionId" = o."questionId"
        AND (
          o2."sortOrder" < o."sortOrder"
          OR (o2."sortOrder" = o."sortOrder" AND o2.id < o.id)
        )
    ) AS zero_idx
  FROM "PlayerAnswer" pa2
  INNER JOIN "Option" o ON o.id = pa2."optionId"
) sub
WHERE pa.id = sub.pa_id
  AND pa."mcSelectedIndex" IS NULL;

-- GameLobbyQuestionReport: option id keys -> MC index keys
UPDATE "GameLobbyQuestionReport" glqr
SET "optionCountsJson" = (
  SELECT COALESCE(
    jsonb_object_agg(
      CASE
        WHEN mapped.new_idx IS NOT NULL THEN mapped.new_idx::text
        ELSE elem.key
      END,
      elem.value
    ),
    '{}'::jsonb
  )
  FROM jsonb_each(glqr."optionCountsJson") AS elem(key, value)
  LEFT JOIN LATERAL (
    SELECT (
      SELECT COUNT(*)::int
      FROM "Option" o2
      WHERE o2."questionId" = o."questionId"
        AND (
          o2."sortOrder" < o."sortOrder"
          OR (o2."sortOrder" = o."sortOrder" AND o2.id < o.id)
        )
    ) AS new_idx
    FROM "Option" o
    WHERE o.id = NULLIF(elem.key, '')::int
  ) AS mapped ON true
)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Option');

ALTER TABLE "PlayerAnswer" DROP CONSTRAINT IF EXISTS "PlayerAnswer_optionId_fkey";
ALTER TABLE "PlayerAnswer" DROP COLUMN IF EXISTS "optionId";

ALTER TABLE "Question" DROP COLUMN IF EXISTS "correctText";
ALTER TABLE "Question" DROP COLUMN IF EXISTS "rangeMin";
ALTER TABLE "Question" DROP COLUMN IF EXISTS "rangeMax";
ALTER TABLE "Question" DROP COLUMN IF EXISTS "rangeInclusive";

DROP TABLE IF EXISTS "Option";
