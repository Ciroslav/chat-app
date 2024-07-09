-- CreateEnum
CREATE TYPE "user_management"."RelationType" AS ENUM ('PENDING', 'FRIEND', 'BLOCKED');

-- CreateTable
CREATE TABLE "user_management"."user_relations" (
    "id" SERIAL NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "type" "user_management"."RelationType" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "user_relations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_management"."user_relations" ADD CONSTRAINT "user_relations_sender_fkey" FOREIGN KEY ("sender") REFERENCES "user_management"."users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."user_relations" ADD CONSTRAINT "user_relations_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "user_management"."users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."user_relations" ADD CONSTRAINT "user_relations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_management"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
