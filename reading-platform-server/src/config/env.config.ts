import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES: z.string().min(1),
  JWT_REFRESH_EXPIRES: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string(),
  /** Public origin of this API (e.g. https://api.example.com). Used for startup logs; omit in dev (defaults to localhost:PORT). */
  API_PUBLIC_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional()
  ),
});

export const ENV = envSchema.parse(process.env);
