-- CreateEnum
CREATE TYPE "AgeRating" AS ENUM ('EVERYONE', 'TEEN', 'MATURE', 'ADULT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN     "ageRating" "AgeRating" NOT NULL DEFAULT 'EVERYONE',
ADD COLUMN     "isModerated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "UserDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDeletionRequest" ADD CONSTRAINT "UserDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
