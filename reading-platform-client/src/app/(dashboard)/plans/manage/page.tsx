"use client";

import React from "react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { Role } from "@/shared/types/enums";
import { PlansAdminPage } from "@/features/plans/components/plans-admin-page";
import { PageBackLink } from "@/shared/components/page-back-link";
import { dashboardPageShell } from "@/shared/lib/dashboard-shell";
import { cn } from "@/lib/utils";

const PLAN_ADMIN_ROLES = [Role.ADMIN] as const;

export default function ManagePlansPage() {
  return (
    <RoleGuard allowedRoles={PLAN_ADMIN_ROLES} redirectTo="/subscribe">
      <div className={cn(dashboardPageShell, "space-y-8")}>
        <PageBackLink href="/subscribe" label="Back to subscribe" />
        <PlansAdminPage />
      </div>
    </RoleGuard>
  );
}
