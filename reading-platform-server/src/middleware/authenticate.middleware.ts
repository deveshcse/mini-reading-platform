import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import { UnauthorizedError } from "../utils/api-error.js";

import { Role } from "../generated/prisma/enums.js";

interface AccessTokenPayload {
  userId: string;
  email: string;
  roles: Role[];
}


/**
 * Verifies the Bearer access token from the Authorization header.
 * Attaches the decoded payload to req.user.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authentication required"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AccessTokenPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
};

/**
 * Optionally verifies the Bearer access token.
 * If a token is provided, it populates req.user.
 * If no token is provided, it proceeds as a guest.
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
};

