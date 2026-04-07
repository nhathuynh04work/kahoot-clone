-- Enable pgvector (required for `vector(n)` columns)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');

-- CreateEnum
CREATE TYPE "BillingLedgerEntryType" AS ENUM ('invoice_paid', 'refund');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PARSING', 'READY', 'ERROR');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'NUMBER_INPUT');

-- CreateEnum
CREATE TYPE "AiChatRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('CREATED', 'WAITING', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeProcessedEvent" (
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeProcessedEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "RevenueLedgerEntry" (
    "id" SERIAL NOT NULL,
    "type" "BillingLedgerEntryType" NOT NULL DEFAULT 'invoice_paid',
    "stripeEventId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeChargeId" TEXT,
    "stripeRefundId" TEXT,
    "stripePaymentIntentId" TEXT,
    "receiptUrl" TEXT,
    "amountCentsSigned" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "userId" INTEGER,
    "subscriptionId" INTEGER,
    "stripePriceId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeInvoice" (
    "id" SERIAL NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "userId" INTEGER,
    "subscriptionId" INTEGER,
    "stripeSubscriptionId" TEXT,
    "status" TEXT,
    "totalCents" INTEGER,
    "amountPaidCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "hostedInvoiceUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "cloudinaryPublicId" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSave" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSave" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" vector(768) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "text" TEXT,
    "timeLimit" INTEGER NOT NULL DEFAULT 20000,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "data" JSONB NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizChatSession" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" "AiChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "documentId" INTEGER,
    "generatedCount" INTEGER,
    "generatedQuestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobby" (
    "id" SERIAL NOT NULL,
    "pin" CHAR(6) NOT NULL,
    "quizId" INTEGER NOT NULL,
    "hostId" INTEGER NOT NULL,
    "status" "LobbyStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "GameLobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lobbyId" INTEGER NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAnswer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "mcSelectedIndex" INTEGER,
    "textAnswer" TEXT,
    "numericAnswer" DECIMAL(18,6),
    "isCorrect" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobbyReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "totalAnswers" INTEGER NOT NULL,
    "totalCorrect" INTEGER NOT NULL,
    "totalIncorrect" INTEGER NOT NULL,
    "avgAccuracy" DOUBLE PRECISION NOT NULL,
    "leaderboardJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLobbyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobbyQuestionReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "sortIndex" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "correctRate" DOUBLE PRECISION NOT NULL,
    "optionCountsJson" JSONB NOT NULL,
    "answerSummaryJson" JSONB,

    CONSTRAINT "GameLobbyQuestionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLobbyPlayerReport" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "answeredCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "finalScore" INTEGER NOT NULL,

    CONSTRAINT "GameLobbyPlayerReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueLedgerEntry_stripeEventId_key" ON "RevenueLedgerEntry"("stripeEventId");

-- CreateIndex
CREATE INDEX "RevenueLedgerEntry_occurredAt_idx" ON "RevenueLedgerEntry"("occurredAt");

-- CreateIndex
CREATE INDEX "RevenueLedgerEntry_userId_idx" ON "RevenueLedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "RevenueLedgerEntry_subscriptionId_idx" ON "RevenueLedgerEntry"("subscriptionId");

-- CreateIndex
CREATE INDEX "RevenueLedgerEntry_stripeInvoiceId_idx" ON "RevenueLedgerEntry"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeInvoice_stripeInvoiceId_key" ON "StripeInvoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "StripeInvoice_userId_idx" ON "StripeInvoice"("userId");

-- CreateIndex
CREATE INDEX "StripeInvoice_subscriptionId_idx" ON "StripeInvoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "StripeInvoice_paidAt_idx" ON "StripeInvoice"("paidAt");

-- CreateIndex
CREATE INDEX "QuizSave_quizId_idx" ON "QuizSave"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSave_userId_quizId_key" ON "QuizSave"("userId", "quizId");

-- CreateIndex
CREATE INDEX "DocumentSave_documentId_idx" ON "DocumentSave"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSave_userId_documentId_key" ON "DocumentSave"("userId", "documentId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_quizId_sortOrder_key" ON "Question"("quizId", "sortOrder");

-- CreateIndex
CREATE INDEX "AiQuizChatSession_userId_idx" ON "AiQuizChatSession"("userId");

-- CreateIndex
CREATE INDEX "AiQuizChatSession_lastActivityAt_idx" ON "AiQuizChatSession"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiQuizChatSession_quizId_userId_key" ON "AiQuizChatSession"("quizId", "userId");

-- CreateIndex
CREATE INDEX "AiQuizChatMessage_sessionId_createdAt_idx" ON "AiQuizChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_lobbyId_nickname_key" ON "GamePlayer"("lobbyId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAnswer_playerId_questionId_key" ON "PlayerAnswer"("playerId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyReport_lobbyId_key" ON "GameLobbyReport"("lobbyId");

-- CreateIndex
CREATE INDEX "GameLobbyReport_lobbyId_idx" ON "GameLobbyReport"("lobbyId");

-- CreateIndex
CREATE INDEX "GameLobbyQuestionReport_lobbyId_idx" ON "GameLobbyQuestionReport"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyQuestionReport_reportId_questionId_key" ON "GameLobbyQuestionReport"("reportId", "questionId");

-- CreateIndex
CREATE INDEX "GameLobbyPlayerReport_lobbyId_idx" ON "GameLobbyPlayerReport"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLobbyPlayerReport_reportId_playerId_key" ON "GameLobbyPlayerReport"("reportId", "playerId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueLedgerEntry" ADD CONSTRAINT "RevenueLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueLedgerEntry" ADD CONSTRAINT "RevenueLedgerEntry_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeInvoice" ADD CONSTRAINT "StripeInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeInvoice" ADD CONSTRAINT "StripeInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSave" ADD CONSTRAINT "QuizSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSave" ADD CONSTRAINT "QuizSave_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSave" ADD CONSTRAINT "DocumentSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSave" ADD CONSTRAINT "DocumentSave_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatMessage" ADD CONSTRAINT "AiQuizChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiQuizChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatMessage" ADD CONSTRAINT "AiQuizChatMessage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobby" ADD CONSTRAINT "GameLobby_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyReport" ADD CONSTRAINT "GameLobbyReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyQuestionReport" ADD CONSTRAINT "GameLobbyQuestionReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GameLobbyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyQuestionReport" ADD CONSTRAINT "GameLobbyQuestionReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "GameLobbyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "GameLobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLobbyPlayerReport" ADD CONSTRAINT "GameLobbyPlayerReport_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
