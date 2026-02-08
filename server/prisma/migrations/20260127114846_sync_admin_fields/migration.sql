/*
  Warnings:

  - A unique constraint covering the columns `[userId,mangaId]` on the table `UserMangaInteraction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserMangaInteraction_userId_mangaId_idx";

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "sipnosis" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserMangaInteraction_userId_mangaId_key" ON "UserMangaInteraction"("userId", "mangaId");
