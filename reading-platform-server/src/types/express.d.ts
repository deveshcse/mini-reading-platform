// Augment the Express Request interface so req.user is fully typed
// across the entire application without casting.

import { Role } from "../generated/prisma/enums.js";

export {};

interface AuthUser {
  userId: string;
  email: string;
  roles: Role[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}