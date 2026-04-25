// Augment the Express Request interface so req.user is fully typed
// across the entire application without casting.

import { Role } from "../generated/prisma/enums.js";

export {};

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** Filled by `validate` middleware: parsed { body, query, params } from Zod */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}