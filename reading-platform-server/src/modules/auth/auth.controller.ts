import { type Request, type Response, type NextFunction } from "express";
import * as authService from "./auth.service.js";
import { sendSuccess } from "../../utils/api-response.js";
import {
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./auth.schema.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // Lax is usually safer for local/mixed envs
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching refresh expires
  path: "/",
};

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, COOKIE_OPTIONS);
}

// ── register ──────────────────────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as RegisterInput;
    const result = await authService.register(input);

    // Set cookie
    setRefreshTokenCookie(res, result.refreshToken);

    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

// ── login ─────────────────────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const result = await authService.login(input);

    // Set cookie
    setRefreshTokenCookie(res, result.refreshToken);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ── refresh ───────────────────────────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check body first, then fallback to cookie
    const refreshToken = (req.body as RefreshInput).refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: "No refresh token provided" });
      return;
    }

    const result = await authService.refresh(refreshToken);

    // Rotate: Set new refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ── logout ────────────────────────────────────────────────────────────────────

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    await authService.logout(req.user.userId);


    // Clear cookie
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    sendSuccess(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// ── forgotPassword ───────────────────────────────────────────────────────────
// POST /api/v1/auth/forgot-password

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as ForgotPasswordInput;
    await authService.forgotPassword(input);
    sendSuccess(res, {
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
}

// ── resetPassword ────────────────────────────────────────────────────────────
// POST /api/v1/auth/reset-password

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as ResetPasswordInput;
    await authService.resetPassword(input);
    sendSuccess(res, { message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
}
