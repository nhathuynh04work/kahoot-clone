-- Drop deprecated per-player lobby report table.
-- Data is now derived from `GamePlayer` + `PlayerAnswer` for reports.
DROP TABLE IF EXISTS "GameLobbyPlayerReport";

