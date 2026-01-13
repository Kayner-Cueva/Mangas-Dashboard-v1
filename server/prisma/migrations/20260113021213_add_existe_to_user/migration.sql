/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "url_capitulo" TEXT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "existe" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW();
