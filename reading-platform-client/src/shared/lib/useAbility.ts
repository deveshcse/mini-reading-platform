import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Action, can, Resource } from "./statements";

export function useAbility() {
  const { user } = useAuthContext();

  return {
    can: (resource: Resource, action: Action) => can(user?.role, resource, action),
  };
}