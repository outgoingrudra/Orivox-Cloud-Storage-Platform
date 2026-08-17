-- CreateEnum
CREATE TYPE "DeletionJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "StorageDeletionJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "fileId" TEXT,
    "size" BIGINT NOT NULL,
    "status" "DeletionJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StorageDeletionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StorageDeletionJob_status_idx" ON "StorageDeletionJob"("status");

-- CreateIndex
CREATE INDEX "StorageDeletionJob_userId_idx" ON "StorageDeletionJob"("userId");

-- CreateIndex
CREATE INDEX "StorageDeletionJob_createdAt_idx" ON "StorageDeletionJob"("createdAt");
