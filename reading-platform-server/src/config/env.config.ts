import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(1).default("fallback-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(1).default("fallback-refresh-secret"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  RESEND_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

export const ENV = envSchema.parse(process.env);
