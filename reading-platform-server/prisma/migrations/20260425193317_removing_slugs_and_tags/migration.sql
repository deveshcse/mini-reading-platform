/*
  Warnings:

  - You are about to drop the column `slug` on the `stories` table. All the data in the column will be lost.
  - You are about to drop the `story_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "story_tags" DROP CONSTRAINT "story_tags_storyId_fkey";

-- DropForeignKey
ALTER TABLE "story_tags" DROP CONSTRAINT "story_tags_tagId_fkey";

-- DropIndex
DROP INDEX "stories_slug_idx";

-- DropIndex
DROP INDEX "stories_slug_key";

-- AlterTable
ALTER TABLE "stories" DROP COLUMN "slug";

-- DropTable
DROP TABLE "story_tags";

-- DropTable
DROP TABLE "tags";
