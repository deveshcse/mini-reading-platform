import { type Request, type Response } from "express";
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

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(
    req.validated!.body as RegisterInput
  );
  setRefreshTokenCookie(res, result.refreshToken);
  sendSuccess(res, result, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.validated!.body as LoginInput);
  setRefreshTokenCookie(res, result.refreshToken);
  sendSuccess(res, result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken =
    (req.validated?.body as RefreshInput | undefined)?.refreshToken ||
    req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "No refresh token provided" });
    return;
  }

  const result = await authService.refresh(refreshToken);
  setRefreshTokenCookie(res, result.refreshToken);
  sendSuccess(res, result);
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  await authService.logout(req.user.userId);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  sendSuccess(res, { message: "Logged out successfully" });
}

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  await authService.forgotPassword(
    req.validated!.body as ForgotPasswordInput
  );
  sendSuccess(res, {
    message: "Password reset link has been sent to your email.",
  });
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  await authService.resetPassword(
    req.validated!.body as ResetPasswordInput
  );
  sendSuccess(res, { message: "Password has been reset successfully." });
}
