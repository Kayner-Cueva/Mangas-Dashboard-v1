-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EDITOR';

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN     "isAdult" BOOLEAN NOT NULL DEFAULT false;
