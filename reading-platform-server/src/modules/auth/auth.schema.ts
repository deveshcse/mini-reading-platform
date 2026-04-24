import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be at most 72 characters"),
    role: z.enum(["READER", "AUTHOR"], {
      message: "Role must be either READER or AUTHOR",
    }),

  }),
});


export type RegisterInput = z.infer<typeof registerSchema>["body"];

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

// ── Refresh ───────────────────────────────────────────────────────────────────

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export type RefreshInput = z.infer<typeof refreshSchema>["body"];

// ── Forgot Password ───────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];

// ── Reset Password ────────────────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be at most 72 characters"),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
