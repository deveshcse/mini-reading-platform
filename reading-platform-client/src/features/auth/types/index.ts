import { Role } from "@/shared/types/enums";

/**
 * Logged-in user from `/auth/*` and `/auth/refresh` — one role per account (matches Prisma `Account.role`).
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
