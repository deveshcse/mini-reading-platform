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

function signRefreshToken(payload: { accountId: string }): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}


// ── Register ──────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  let user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { accounts: true },
  });

  if (user) {
    // Check if the user already has an account for the requested role
    const existingAccount = user.accounts.find((a) => a.role === input.role);
    if (existingAccount) {
      // For idempotency and "linking" support, we check if password matches
      const isMatch = await bcrypt.compare(input.password, existingAccount.password);
      if (!isMatch) {
        throw new ConflictError("An account with this email and role already exists");
      }
      // If it matches, we treat it as a login
    } else {
      // Verify password against at least ONE of the existing accounts for security
      // (This ensures the same person is adding the role)
      const matchesAny = await Promise.all(
        user.accounts.map((acc) => bcrypt.compare(input.password, acc.password))
      );
      if (!matchesAny.some(Boolean)) {
        throw new ConflictError("An account with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      await prisma.account.create({
        data: {
          userId: user.id,
          role: input.role,
          password: hashedPassword,
        },
      });
      // Refresh user to get updated accounts
      user = (await prisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      })) as any;
    }
  } else {
    // Brand new user
    const hashedPassword = await bcrypt.hash(input.password, 12);
    user = await prisma.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        accounts: {
          create: {
            role: input.role,
            password: hashedPassword,
          },
        },
      },
      include: {
        accounts: true,
      },
    });
  }

  if (!user) {
    throw new NotFoundError("User not found after registration");
  }

  const account = user.accounts.find((a) => a.role === input.role)!;
  const roles = user.accounts.map((a) => a.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const refreshToken = signRefreshToken({ accountId: String(account.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.account.update({
    where: { id: account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { accounts: _acc, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken };
}


// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { accounts: true },
  });

  if (!user) {
    await bcrypt.compare(input.password, "$2b$12$invalidsaltfortimingprotect");
    throw new UnauthorizedError("Invalid email or password");
  }

  const account = user.accounts.find((a) => a.role === input.role);
  if (!account) {
    throw new UnauthorizedError(`No ${input.role} account found for this email`);
  }

  const isMatch = await bcrypt.compare(input.password, account.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const roles = user.accounts.map((a) => a.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const refreshToken = signRefreshToken({ accountId: String(account.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.account.update({
    where: { id: account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { accounts: _acc, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken };
}


// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refresh(incomingToken: string) {
  let payload: { accountId: string };
  try {
    payload = jwt.verify(incomingToken, ENV.JWT_REFRESH_SECRET) as {
      accountId: string;
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const account = await prisma.account.findUnique({
    where: { id: Number(payload.accountId) },
    include: { 
      user: {
        include: { accounts: true }
      }
    },
  });

  if (!account?.refreshToken) {
    throw new UnauthorizedError("Session not found — please log in again");
  }

  const isValid = await bcrypt.compare(incomingToken, account.refreshToken);
  if (!isValid) {
    await prisma.account.update({
      where: { id: account.id },
      data: { refreshToken: null },
    });
    throw new UnauthorizedError(
      "Refresh token reuse detected — please log in again"
    );
  }

  const user = account.user;
  const roles = user.accounts.map((a) => a.role);

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    roles,
  });
  const newRefreshToken = signRefreshToken({ accountId: String(account.id) });
  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

  await prisma.account.update({
    where: { id: account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { accounts: _acc, ...safeUser } = user;
  return { user: { ...safeUser, roles }, accessToken, refreshToken: newRefreshToken };
}


// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Logout from a specific account's session.
 * In this multi-account model, we need the accountId or we clear all if preferred.
 * For now, we clear the one matching the current session's role.
 */
export async function logout(userId: string, role: Role) {
  await prisma.account.updateMany({
    where: { userId: Number(userId), role },
    data: { refreshToken: null },
  });
}


// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput) {
  // Since we have multiple accounts, we might need a role here too,
  // or we reset all of them. Let's assume we reset based on the primary or all.
  // For simplicity and matching the "Register" flow, let's reset ALL accounts 
  // for this user, or just the accounts that exist.
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { accounts: true }
  });

  if (!user || user.accounts.length === 0) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Reset ALL accounts for this email
  await prisma.account.updateMany({
    where: { userId: user.id },
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

  const account = await prisma.account.findFirst({
    where: {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!account) {
    throw new BadRequestError("Invalid or expired password reset token");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Update password for ALL accounts of this user to keep them in sync 
  // (Optional behavior, but usually desired for a single user entity)
  await prisma.account.updateMany({
    where: { userId: account.userId },
    data: {
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiresAt: null,
    },
  });
}

