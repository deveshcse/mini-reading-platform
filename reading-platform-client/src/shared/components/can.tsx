import { Action, Resource } from "@/shared/lib/statements";
import { useAbility } from "@/shared/lib/useAbility";

interface CanProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ resource, action, children, fallback = null }: CanProps) {
  const { can } = useAbility();
  return can(resource, action) ? <>{children}</> : <>{fallback}</>;
}