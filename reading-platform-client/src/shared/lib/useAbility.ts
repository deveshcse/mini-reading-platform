import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Action, can, Resource } from "./statements";

export function useAbility() {
  const { user } = useAuthContext();
  const userRoles = user?.roles ?? [];

  return {
    can: (resource: Resource, action: Action) => can(userRoles, resource, action),
  };
}