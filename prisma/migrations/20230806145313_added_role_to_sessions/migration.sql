/*
  Warnings:

  - You are about to drop the column `loginIpAdress` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `roles` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "loginIpAdress",
ADD COLUMN     "loginIpAddress" TEXT,
ADD COLUMN     "roles" TEXT NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "roles" SET NOT NULL,
ALTER COLUMN "roles" SET DEFAULT 'USER',
ALTER COLUMN "roles" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
