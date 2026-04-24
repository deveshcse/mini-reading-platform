import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../../config/db.config.js";
import { ENV } from "../../config/env.config.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/api-error.js";
import {
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./auth.schema.js";
import { Role } from "../../generated/prisma/enums.js";
import { sendResetPasswordEmail } from "../../utils/email.js";

// ── Token helpers ─────────────────────────────────────────────────────────────

function signAccessToken(payload: {
  userId: string;
  email: string;
  roles: Role[];
}): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}


// ── Register ──────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: hashedPassword,
      roles: {
        create: {
          role: input.role,
        },
      },
    },
    include: {
      roles: true,
    },
  });

  const roles = user.roles.map((r) => r.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const refreshToken = signRefreshToken({ userId: String(user.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  const { password: _pw, refreshToken: _rt, roles: _r, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken };
}


// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { roles: true },
  });

  if (!user) {
    await bcrypt.compare(input.password, "$2b$12$invalidsaltfortimingprotect");
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const roles = user.roles.map((r) => r.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const refreshToken = signRefreshToken({ userId: String(user.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  const { password: _pw, refreshToken: _rt, roles: _r, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken };
}


// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refresh(incomingToken: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(incomingToken, ENV.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.userId) },
    include: { roles: true },
  });

  if (!user?.refreshToken) {
    throw new UnauthorizedError("Session not found — please log in again");
  }

  const isValid = await bcrypt.compare(incomingToken, user.refreshToken);
  if (!isValid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    throw new UnauthorizedError(
      "Refresh token reuse detected — please log in again"
    );
  }

  const roles = user.roles.map((r) => r.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const newRefreshToken = signRefreshToken({ userId: String(user.id) });
  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  const { password: _pw, refreshToken: _rt, roles: _r, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken: newRefreshToken };
}


// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(userId: string) {
  await prisma.user.update({
    where: { id: Number(userId) },
    data: { refreshToken: null },
  });
}


// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendResetPasswordEmail(user.email, resetToken);
}


// ── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(input: ResetPasswordInput) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(input.token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired password reset token");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiresAt: null,
    },
  });
}

