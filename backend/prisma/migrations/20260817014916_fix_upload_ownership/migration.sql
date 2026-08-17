/*
  Warnings:

  - You are about to drop the column `userId` on the `UploadReservation` table. All the data in the column will be lost.
  - Added the required column `initiatedById` to the `UploadReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `UploadReservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UploadReservation" DROP CONSTRAINT "UploadReservation_userId_fkey";

-- DropIndex
DROP INDEX "UploadReservation_userId_idx";

-- AlterTable
ALTER TABLE "UploadReservation" DROP COLUMN "userId",
ADD COLUMN     "initiatedById" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "UploadReservation_ownerId_idx" ON "UploadReservation"("ownerId");

-- CreateIndex
CREATE INDEX "UploadReservation_initiatedById_idx" ON "UploadReservation"("initiatedById");

-- AddForeignKey
ALTER TABLE "UploadReservation" ADD CONSTRAINT "UploadReservation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadReservation" ADD CONSTRAINT "UploadReservation_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
