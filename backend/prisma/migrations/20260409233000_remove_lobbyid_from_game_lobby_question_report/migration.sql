-- Remove redundant lobbyId from question report rows.
-- The lobby can be derived via GameLobbyQuestionReport.reportId -> GameLobbyReport.lobbyId.

ALTER TABLE "GameLobbyQuestionReport"
    DROP CONSTRAINT IF EXISTS "GameLobbyQuestionReport_lobbyId_fkey";

DROP INDEX IF EXISTS "GameLobbyQuestionReport_lobbyId_idx";

ALTER TABLE "GameLobbyQuestionReport"
    DROP COLUMN IF EXISTS "lobbyId";

