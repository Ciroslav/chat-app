-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "messages";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_management";

-- CreateTable
CREATE TABLE "user_management"."users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "preferred_username" TEXT,
    "email" TEXT NOT NULL,
    "country" TEXT,
    "address" TEXT,
    "phone_number" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_management"."sessions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "login_ip_address" TEXT,
    "rt_hash" TEXT,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_management"."friend_list" (
    "id" SERIAL NOT NULL,
    "user1_uuid" TEXT NOT NULL,
    "user2_uuid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_management"."block_list" (
    "id" SERIAL NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "blocked_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages"."conversations" (
    "id" SERIAL NOT NULL,
    "creator" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public" BOOLEAN DEFAULT false,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages"."message" (
    "id" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachment_url" TEXT,
    "conversation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages"."conversations_users" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TEXT,
    "limited_access" BOOLEAN,
    "access_since" TEXT,

    CONSTRAINT "conversations_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "user_management"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "user_management"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "user_management"."users"("email");

-- CreateIndex
CREATE INDEX "friend_list_user1_uuid_idx" ON "user_management"."friend_list"("user1_uuid");

-- CreateIndex
CREATE INDEX "friend_list_user2_uuid_idx" ON "user_management"."friend_list"("user2_uuid");

-- AddForeignKey
ALTER TABLE "user_management"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_management"."users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."friend_list" ADD CONSTRAINT "friend_list_user1_uuid_fkey" FOREIGN KEY ("user1_uuid") REFERENCES "user_management"."users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."friend_list" ADD CONSTRAINT "friend_list_user2_uuid_fkey" FOREIGN KEY ("user2_uuid") REFERENCES "user_management"."users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."block_list" ADD CONSTRAINT "block_list_blocked_uuid_fkey" FOREIGN KEY ("blocked_uuid") REFERENCES "user_management"."users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."block_list" ADD CONSTRAINT "block_list_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user_management"."users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages"."message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "messages"."conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages"."conversations_users" ADD CONSTRAINT "conversations_users_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "messages"."conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
