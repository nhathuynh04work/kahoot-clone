-- Unify question report breakdown JSON into one column.
-- NOTE: This migration intentionally drops existing breakdown data, per project decision.

ALTER TABLE "GameLobbyQuestionReport" DROP COLUMN "optionCountsJson";
ALTER TABLE "GameLobbyQuestionReport" DROP COLUMN "answerSummaryJson";
ALTER TABLE "GameLobbyQuestionReport" ADD COLUMN "breakdownJson" JSONB;

