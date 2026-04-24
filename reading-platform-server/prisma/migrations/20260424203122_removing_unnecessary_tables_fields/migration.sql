/*
  Warnings:

  - You are about to drop the column `slug` on the `stories` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `story_access` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "story_access" DROP CONSTRAINT "story_access_storyId_fkey";

-- DropForeignKey
ALTER TABLE "story_access" DROP CONSTRAINT "story_access_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "story_access" DROP CONSTRAINT "story_access_userId_fkey";

-- DropIndex
DROP INDEX "stories_slug_idx";

-- DropIndex
DROP INDEX "stories_slug_key";

-- DropIndex
DROP INDEX "tags_slug_key";

-- AlterTable
ALTER TABLE "stories" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "slug";

-- DropTable
DROP TABLE "story_access";
