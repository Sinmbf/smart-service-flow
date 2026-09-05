-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'NE');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('GENERATED', 'CHECKED_IN', 'SERVING', 'COMPLETED', 'SKIPPED', 'EXPIRED', 'CANCELLED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "PriorityReason" AS ENUM ('SENIOR_CITIZEN', 'DISABILITY', 'PREGNANT', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "PriorityDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT,
    "employeeId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentOffice" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionNe" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceStage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "baselineMinutes" INTEGER NOT NULL DEFAULT 10,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredDocument" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameNe" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequiredDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "currentStageId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "serviceStartedAt" TIMESTAMP(3),
    "serviceCompletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceDurationHistory" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "actualMinutes" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceDurationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorityRequest" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" "PriorityReason" NOT NULL,
    "reasonNote" TEXT,
    "decision" "PriorityDecision" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriorityRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleNe" TEXT NOT NULL,
    "messageEn" TEXT NOT NULL,
    "messageNe" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Service_officeId_idx" ON "Service"("officeId");

-- CreateIndex
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

-- CreateIndex
CREATE INDEX "ServiceStage_serviceId_idx" ON "ServiceStage"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceStage_serviceId_stageOrder_key" ON "ServiceStage"("serviceId", "stageOrder");

-- CreateIndex
CREATE INDEX "RequiredDocument_stageId_idx" ON "RequiredDocument"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenNumber_key" ON "Token"("tokenNumber");

-- CreateIndex
CREATE INDEX "Token_serviceId_currentStageId_status_idx" ON "Token"("serviceId", "currentStageId", "status");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE INDEX "Token_status_idx" ON "Token"("status");

-- CreateIndex
CREATE INDEX "ServiceDurationHistory_stageId_completedAt_idx" ON "ServiceDurationHistory"("stageId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Counter_currentTokenId_key" ON "Counter"("currentTokenId");

-- CreateIndex
CREATE INDEX "Counter_stageId_idx" ON "Counter"("stageId");

-- CreateIndex
CREATE INDEX "PriorityRequest_tokenId_idx" ON "PriorityRequest"("tokenId");

-- CreateIndex
CREATE INDEX "PriorityRequest_decision_idx" ON "PriorityRequest"("decision");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "GovernmentOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStage" ADD CONSTRAINT "ServiceStage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredDocument" ADD CONSTRAINT "RequiredDocument_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ServiceStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "ServiceStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDurationHistory" ADD CONSTRAINT "ServiceDurationHistory_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDurationHistory" ADD CONSTRAINT "ServiceDurationHistory_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ServiceStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ServiceStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityRequest" ADD CONSTRAINT "PriorityRequest_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityRequest" ADD CONSTRAINT "PriorityRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
