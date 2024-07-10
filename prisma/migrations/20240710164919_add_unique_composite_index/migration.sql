/*
  Warnings:

  - A unique constraint covering the columns `[sender,receiver]` on the table `user_relations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_relations_sender_receiver_key" ON "user_management"."user_relations"("sender", "receiver");
