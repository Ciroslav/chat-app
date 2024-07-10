/*
  Warnings:

  - You are about to drop the column `userId` on the `user_relations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_management"."user_relations" DROP CONSTRAINT "user_relations_userId_fkey";

-- AlterTable
ALTER TABLE "user_management"."user_relations" DROP COLUMN "userId";
