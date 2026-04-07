-- Convert legacy NUMBER_INPUT rangeMin/rangeMax(/rangeInclusive) into
-- correctNumber + rangeProximity and delete legacy keys.
--
-- Legacy shape (allowRange=true):
--   { allowRange: true, rangeMin: number, rangeMax: number, rangeInclusive?: boolean }
-- New shape:
--   { allowRange: true, correctNumber: number, rangeProximity: number }
--
-- Conversion:
--   correctNumber = (rangeMin + rangeMax) / 2
--   rangeProximity = greatest(abs(rangeMax-correctNumber), abs(correctNumber-rangeMin))
--
-- This is idempotent and only targets rows that still have legacy keys.

WITH legacy AS (
  SELECT
    id,
    data::jsonb AS d,
    (data::jsonb->>'rangeMin')::double precision AS range_min,
    (data::jsonb->>'rangeMax')::double precision AS range_max
  FROM "Question"
  WHERE "type" = 'NUMBER_INPUT'
    AND (data::jsonb->>'allowRange')::boolean IS TRUE
    AND (data::jsonb ? 'rangeMin')
    AND (data::jsonb ? 'rangeMax')
),
computed AS (
  SELECT
    id,
    d,
    range_min,
    range_max,
    ((range_min + range_max) / 2.0) AS correct_number
  FROM legacy
  WHERE range_min IS NOT NULL
    AND range_max IS NOT NULL
    AND range_min <= range_max
),
patched AS (
  SELECT
    id,
    -- Set correctNumber and rangeProximity, then delete legacy keys.
    (
      jsonb_set(
        jsonb_set(
          (d - 'rangeMin' - 'rangeMax' - 'rangeInclusive'),
          '{correctNumber}',
          to_jsonb(correct_number),
          true
        ),
        '{rangeProximity}',
        to_jsonb(GREATEST(ABS(range_max - correct_number), ABS(correct_number - range_min))),
        true
      )
    ) AS new_data
  FROM computed
)
UPDATE "Question" q
SET "data" = patched.new_data
FROM patched
WHERE q.id = patched.id;

