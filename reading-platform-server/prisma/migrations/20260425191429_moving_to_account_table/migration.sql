/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `forgotPasswordToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `forgotPasswordTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `user_to_roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `stories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_to_roles" DROP CONSTRAINT "user_to_roles_userId_fkey";

-- DropIndex
DROP INDEX "users_emailVerificationToken_key";

-- DropIndex
DROP INDEX "users_forgotPasswordToken_key";

-- DropIndex
DROP INDEX "users_refreshToken_key";

-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpiresAt",
DROP COLUMN "forgotPasswordToken",
DROP COLUMN "forgotPasswordTokenExpiresAt",
DROP COLUMN "isEmailVerified",
DROP COLUMN "password",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt";

-- DropTable
DROP TABLE "user_to_roles";

-- DropEnum
DROP TYPE "StoryAccessReason";

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "password" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiresAt" TIMESTAMP(3),
    "forgotPasswordToken" TEXT,
    "forgotPasswordTokenExpiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_emailVerificationToken_key" ON "accounts"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_forgotPasswordToken_key" ON "accounts"("forgotPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_refreshToken_key" ON "accounts"("refreshToken");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_userId_role_key" ON "accounts"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "stories_slug_idx" ON "stories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
