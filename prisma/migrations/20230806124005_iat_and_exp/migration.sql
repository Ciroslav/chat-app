/*
  Warnings:

  - Made the column `expiresAt` on table `sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `issuedAt` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "expiresAt" SET NOT NULL,
ALTER COLUMN "issuedAt" SET NOT NULL;
