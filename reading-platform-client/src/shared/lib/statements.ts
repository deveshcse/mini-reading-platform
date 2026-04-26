import { Role } from "../types/enums";

// ─── 1. Define all resources and their possible actions ───────────────────────

const statement = {
  story:        ["create", "read", "update", "delete", "publish"],
  comment:      ["create", "read", "update", "delete"],
  user:         ["read", "update", "delete", "manage"],
  plan:         ["create", "read", "update", "delete"],
  payment:      ["read"],
  subscription: ["read", "update"],
  tag:          ["create", "read"],
} as const;

// ─── 2. Types derived from statement (no manual maintenance) ──────────────────

type Statement = typeof statement;
export type Resource = keyof Statement;
export type Action<R extends Resource = Resource> = Statement[R][number];

type Permission<R extends Resource = Resource> = {
  [K in R]: { resource: K; actions: Statement[K][number][] };
}[R];

// ─── 3. Factory — mirrors better-auth's createAccessControl ──────────────────

function createAccessControl<S extends Record<string, readonly string[]>>(s: S) {
  function newRole(permissions: {
    [R in keyof S]?: S[R][number][];
  }) {
    return permissions;
  }

  return { newRole };
}
const ac = createAccessControl(statement);

// ─── 4. Role definitions — clean, readable, single source of truth ────────────

export const roles = {
  [Role.ADMIN]: ac.newRole({
    story:        ["create", "read", "update", "delete", "publish"],
    comment:      ["create", "read", "update", "delete"],
    user:         ["read", "update", "delete", "manage"],
    plan:         ["create", "read", "update", "delete"],
    payment:      ["read"],
    subscription: ["read", "update"],
    tag:          ["create", "read"],
  }),

  [Role.AUTHOR]: ac.newRole({
    story:        ["create", "read", "update", "delete", "publish"],
    plan:         ["read"],
    payment:      ["read"],
    subscription: ["read"],
  }),

  [Role.READER]: ac.newRole({
    story:        ["read"],
    subscription: ["read"],
    payment:      ["read"],
    plan:         ["read"],
  }),
} satisfies Record<Role, ReturnType<typeof ac.newRole>>;

// ─── 5. Permission check function (mirrors server `statements.ts` + `can`) ─────

export function can(
  userRole: Role | null | undefined,
  resource: Resource,
  action: string
): boolean {
  if (!userRole) return false;
  const permissions = roles[userRole];
  const allowed = permissions[resource as keyof typeof permissions] as
    | string[]
    | undefined;
  return allowed?.includes(action) ?? false;
}