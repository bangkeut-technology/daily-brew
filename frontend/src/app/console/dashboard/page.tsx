"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/auth-provider";
import { useRoleContext } from "@/hooks/useRoleContext";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: roleContext } = useRoleContext();

  const role = roleContext?.isOwner
    ? "Owner"
    : roleContext?.isManager
      ? "Manager"
      : "Employee";

  return (
    <div className="page-enter">
      <h1 className="font-serif text-3xl font-semibold text-text-primary">
        {t("nav.dashboard", "Dashboard")}
      </h1>
      <p className="mt-2 text-text-secondary">
        Signed in as {user?.fullName || user?.email}
        {roleContext ? ` · ${role}` : ""}.
      </p>

      <div className="mt-8 glass-card max-w-lg p-6">
        <p className="text-sm text-text-secondary">
          The console shell is live — auth, the API client with token refresh, role-aware
          navigation, and route guards are wired up. Feature screens are being ported next.
        </p>
      </div>
    </div>
  );
}
