import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role } from "../src/generated/prisma/enums.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run seed");
}

const ADMIN_EMAIL = "admin@reading.local";
const ADMIN_PASSWORD = "admin123";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      firstName: "Admin",
      lastName: "User",
      deletedAt: null,
    },
    create: {
      email: ADMIN_EMAIL,
      firstName: "Admin",
      lastName: "User",
    },
  });

  await prisma.account.upsert({
    where: { userId: user.id },
    update: {
      role: Role.ADMIN,
      password: passwordHash,
      isEmailVerified: true,
      refreshToken: null,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiresAt: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    },
    create: {
      userId: user.id,
      role: Role.ADMIN,
      password: passwordHash,
      isEmailVerified: true,
    },
  });

  console.log("Admin user seeded successfully.");
  console.log(`email: ${ADMIN_EMAIL}`);
  console.log(`password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
