import { Action, can, Resource } from "./statements";

export function useAbility() {
  const { user } = useSession();
  const userRoles = user?.roles ?? [];

  return {
    can: (resource: Resource, action: Action) => can(userRoles, resource, action),
  };
}