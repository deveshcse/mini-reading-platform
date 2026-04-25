import { Role } from "@/shared/types/enums";
import type { User } from "@/features/auth/types";

const VALID_ROLES = new Set<string>([Role.ADMIN, Role.AUTHOR, Role.READER]);

/**
 * Normalizes the API user payload (Prisma) into our client {@link User} shape.
 * The access token and refresh responses attach a single `role`, not a `roles` array.
 */
export function normalizeUser(data: unknown): User {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid user payload");
  }
  const o = data as Record<string, unknown>;
  const role = o.role;
  if (typeof role !== "string" || !VALID_ROLES.has(role)) {
    throw new Error("Invalid user role in payload");
  }
  return {
    id: String(o.id ?? ""),
    email: String(o.email ?? ""),
    firstName: String(o.firstName ?? ""),
    lastName: String(o.lastName ?? ""),
    role: role as Role,
  };
}
