-- AlterTable
ALTER TABLE "GameLobby" DROP COLUMN IF EXISTS "endReason";

-- DropEnum
DROP TYPE IF EXISTS "LobbyEndReason";

