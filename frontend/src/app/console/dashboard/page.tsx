"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/auth-provider";
import { useRoleContext } from "@/hooks/useRoleContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: roleContext } = useRoleContext();

  const role = roleContext?.isOwner ? "Owner" : roleContext?.isManager ? "Manager" : "Employee";
  const name = user?.fullName || user?.email || "—";

  return (
    <div className="page-enter">
      <PageHeader
        title={t("nav.dashboard", "Dashboard")}
        badge={
          roleContext ? (
            <StatusBadge label={role} variant={roleContext.isOwner ? "green" : "blue"} />
          ) : undefined
        }
      />

      <GlassCard hover={false} className="max-w-lg p-6">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={44} />
          <div>
            <p className="font-medium text-text-primary">{name}</p>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The console shell is live — auth, the API client with token refresh, role-aware
          navigation, and route guards are wired up. Feature screens are being ported next.
        </p>
      </GlassCard>
    </div>
  );
}
