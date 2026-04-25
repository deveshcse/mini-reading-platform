-- DropIndex: was @@unique([userId, role])
DROP INDEX IF EXISTS "accounts_userId_role_key";

-- DropIndex: plain index on userId (replaced by unique below)
DROP INDEX IF EXISTS "accounts_userId_idx";

-- CreateIndex: one account per user
CREATE UNIQUE INDEX "accounts_userId_key" ON "accounts"("userId");
