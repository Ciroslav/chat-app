/*
  Warnings:

  - You are about to drop the column `loginIpAddress` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `users` table. All the data in the column will be lost.
  - Added the required column `role` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "loginIpAddress",
DROP COLUMN "roles",
ADD COLUMN     "loginIpAdress" TEXT,
ADD COLUMN     "role" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roles",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER',
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
