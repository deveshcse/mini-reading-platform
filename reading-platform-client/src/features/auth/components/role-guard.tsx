"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthContext } from "./auth-provider";
import type { Role } from "@/shared/types/enums";

interface RoleGuardProps {
  children: React.ReactNode;
  /** If the user is signed in but their role is not allowed, they are redirected. */
  allowedRoles: readonly Role[];
  /** Where to send users without the required role (default: /stories). */
  redirectTo?: string;
}

/**
 * UI gate aligned with server `authorize()` — hide author-only pages from readers before they hit 403s.
 * Must be used under {@link AuthGuard} (e.g. dashboard layout).
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/stories",
}) => {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      toast.error("You do not have permission to view this page.");
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
