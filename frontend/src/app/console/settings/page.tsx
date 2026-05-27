"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getWorkspacePublicId } from "@/lib/api";
import { useWorkspaceSettings, useUpdateWorkspaceSettings } from "@/hooks/useWorkspaceSettings";
import { usePlan } from "@/hooks/usePlan";
import type { WorkspaceSetting } from "@/types/workspace";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/shared/Toggle";
import { CustomSelect } from "@/components/shared/CustomSelect";

function timezoneOptions() {
  const list =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["UTC", "Asia/Phnom_Penh"];
  return list.map((tz) => ({ value: tz, label: tz }));
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [workspaceId] = useState<string | null>(() => getWorkspacePublicId());
  const wsId = workspaceId ?? "";

  const { data: settings, isLoading } = useWorkspaceSettings(wsId);
  const { data: plan } = usePlan(wsId);
  const update = useUpdateWorkspaceSettings(wsId);

  const tzOptions = useMemo(() => timezoneOptions(), []);
  const espresso = plan?.isEspresso ?? false;

  const save = (patch: Partial<WorkspaceSetting>, label: string) => {
    update.mutate(patch, {
      onSuccess: () => toast.success(`${label} updated`),
      onError: () => toast.error(`Could not update ${label.toLowerCase()}`),
    });
  };

  return (
    <div className="page-enter max-w-2xl">
      <PageHeader title={t("nav.settings", "Settings")} />

      {isLoading || !settings ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <div className="space-y-5">
          <GlassCard hover={false}>
            <GlassCardHeader title="General" />
            <div className="p-5">
              <label
                htmlFor="timezone"
                className="mb-1 block text-[13px] font-medium text-text-secondary"
              >
                Timezone
              </label>
              <CustomSelect
                id="timezone"
                value={settings.timezone}
                onChange={(tz) => save({ timezone: tz }, "Timezone")}
                options={tzOptions}
                searchable
              />
              <p className="mt-2 text-xs text-text-tertiary">
                Used for check-in times, late flags, and daily summaries.
              </p>
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <GlassCardHeader title="Check-in verification" />
            <div className="divide-y divide-cream-3/70">
              <SettingRow
                title="IP restriction"
                description="Only allow check-ins from your shop's network."
                espresso={espresso}
              >
                <Toggle
                  checked={espresso && settings.ipRestrictionEnabled}
                  disabled={!espresso || update.isPending}
                  onChange={(v) => save({ ipRestrictionEnabled: v }, "IP restriction")}
                />
              </SettingRow>

              <SettingRow
                title="Device verification"
                description="Bind each check-in to the employee's device."
                espresso={espresso}
              >
                <Toggle
                  checked={espresso && settings.deviceVerificationEnabled}
                  disabled={!espresso || update.isPending}
                  onChange={(v) => save({ deviceVerificationEnabled: v }, "Device verification")}
                />
              </SettingRow>

              <SettingRow
                title="Geofencing"
                description="Require staff to be physically near the shop."
                espresso={espresso}
              >
                <Toggle
                  checked={espresso && settings.geofencingEnabled}
                  disabled={!espresso || update.isPending}
                  onChange={(v) => save({ geofencingEnabled: v }, "Geofencing")}
                />
              </SettingRow>
            </div>
          </GlassCard>

          <p className="text-xs text-text-tertiary">
            Allowed-IP list and geofence coordinates are configured in a later step.
          </p>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  title,
  description,
  espresso,
  children,
}: {
  title: string;
  description: string;
  espresso: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="flex items-center gap-2 font-medium text-text-primary">
          {title}
          {!espresso && (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber">
              Espresso
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
      </div>
      {children}
    </div>
  );
}
