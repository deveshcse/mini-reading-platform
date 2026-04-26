import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../../config/db.config.js";
import { ENV } from "../../config/env.config.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
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
  role: Role;
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
  const existing = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
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
      account: {
        create: {
          role: input.role as Role,
          password: hashedPassword,
        },
      },
    },
    include: { account: true },
  });

  if (!user.account) {
    throw new Error("Registration failed to create account");
  }

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    role: user.account.role,
  });
  const refreshToken = signRefreshToken({ accountId: String(user.account.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.account.update({
    where: { id: user.account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { account: _account, ...safeUser } = user;
  return { user: { ...safeUser, role: user.account.role }, accessToken, refreshToken };
}


// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { account: true },
  });

  if (!user?.account) {
    await bcrypt.compare(input.password, "$2b$12$invalidsaltfortimingprotect");
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(input.password, user.account.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    role: user.account.role,
  });
  const refreshToken = signRefreshToken({ accountId: String(user.account.id) });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.account.update({
    where: { id: user.account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { account: _account, ...safeUser } = user;
  return { user: { ...safeUser, role: user.account.role }, accessToken, refreshToken };
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
        include: { account: true },
      },
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
  if (!user.account) {
    throw new UnauthorizedError("Session not found — please log in again");
  }

  const accessToken = signAccessToken({
    userId: String(user.id),
    email: user.email,
    role: user.account.role,
  });
  const newRefreshToken = signRefreshToken({ accountId: String(account.id) });
  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

  await prisma.account.update({
    where: { id: account.id },
    data: { refreshToken: hashedRefresh },
  });

  const { account: _acc, ...safeUser } = user;
  return { user: { ...safeUser, role: user.account.role }, accessToken, refreshToken: newRefreshToken };
}


// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * Clears the refresh token for this user's auth record (no client role hint).
 */
export async function logout(userId: string) {
  await prisma.account.updateMany({
    where: { userId: Number(userId) },
    data: { refreshToken: null },
  });
}

async function getMeBase(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: Number(userId), deletedAt: null },
    include: {
      account: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      stories: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      bookmarks: {
        include: {
          story: {
            select: {
              id: true,
              title: true,
              isPublished: true,
              isPremium: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user || !user.account) {
    throw new NotFoundError("User profile not found");
  }
  return user;
}

export async function me(userId: string) {
  const user = await getMeBase(userId);
  const account = user.account!;
  const { account: _account, ...safeUser } = user;
  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId: Number(userId), status: "ACTIVE" },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });

  return {
    user: {
      ...safeUser,
      role: account.role,
      isEmailVerified: account.isEmailVerified,
    },
    account: {
      id: account.id,
      role: account.role,
      isEmailVerified: account.isEmailVerified,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
    stats: {
      subscriptionsCount: await prisma.subscription.count({
        where: { userId: Number(userId) },
      }),
      paymentsCount: user.payments.length,
      storiesCount: user.stories.length,
      commentsCount: user.comments.length,
      bookmarksCount: user.bookmarks.length,
    },
    activeSubscription,
  };
}

export async function meSubscriptions(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: Number(userId) },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeSubscription =
    subscriptions.find((s) => s.status === "ACTIVE") ?? null;

  return {
    activeSubscription,
    subscriptions,
  };
}

export async function mePayments(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId: Number(userId) },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return { payments };
}

export async function meActivity(userId: string) {
  const user = await getMeBase(userId);
  return {
    recentStories: user.stories,
    recentComments: user.comments,
    bookmarks: user.bookmarks,
  };
}


// ── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null },
    include: { account: true },
  });

  if (!user?.account) {
    throw new NotFoundError("No active account found with this email address");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.account.update({
    where: { id: user.account.id },
    data: {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
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

  await prisma.account.update({
    where: { id: account.id },
    data: {
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiresAt: null,
    },
  });
}
