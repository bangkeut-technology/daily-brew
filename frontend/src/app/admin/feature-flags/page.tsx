"use client";

import { toast } from "sonner";
import { useAdminFeatureFlags, useUpdateAdminFeatureFlag } from "@/hooks/useAdmin";
import type { FeatureFlagStage } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminFeatureFlagsPage() {
  const { data, isLoading } = useAdminFeatureFlags();
  const update = useUpdateAdminFeatureFlag();

  const setStage = (key: string, stage: FeatureFlagStage) => {
    update.mutate(
      { key, stage },
      {
        onSuccess: () => toast.success("Flag updated"),
        onError: () => toast.error("Could not update flag"),
      },
    );
  };

  const options = (data?.stages ?? []).map((s) => ({ value: s.value, label: s.label }));

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader title="Feature flags" />

      {isLoading || !data ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <GlassCard hover={false} className="divide-y divide-cream-3/70">
          {data.items.map((flag) => (
            <div key={flag.key} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{flag.label}</p>
                <p className="text-sm text-text-tertiary">{flag.description}</p>
              </div>
              <div className="w-40">
                <CustomSelect
                  value={flag.stage}
                  onChange={(stage) => setStage(flag.key, stage as FeatureFlagStage)}
                  options={options}
                />
              </div>
            </div>
          ))}
          {data.items.length === 0 && (
            <p className="px-5 py-8 text-center text-text-secondary">No feature flags.</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
