import { z } from "zod";

/** Aligned with server `auth.schema.ts` — login only requires a non-empty password. */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be at most 72 characters"),
    role: z.enum(["READER", "AUTHOR"]),
    "confirm-password": z.string(),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Passwords do not match",
    path: ["confirm-password"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be at most 72 characters"),
    "confirm-password": z.string(),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Passwords do not match",
    path: ["confirm-password"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
