"use client";

import { ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminFeatureFlags, useUpdateAdminFeatureFlag } from "@/hooks/useAdmin";
import type { FeatureFlagStage } from "@/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { FeatureStageBadge } from "@/components/shared/FeatureStageBadge";
import { Skeleton } from "@/components/admin/AdminDataStates";

const STAGE_TONE: Record<FeatureFlagStage, string> = {
  dev: "bg-text-tertiary/15 text-text-tertiary",
  alpha: "bg-amber/15 text-amber",
  beta: "bg-[#3B6FA0]/15 text-blue",
  release: "bg-green/15 text-green",
};

export default function AdminFeatureFlagsPage() {
  const { data, isLoading } = useAdminFeatureFlags();
  const update = useUpdateAdminFeatureFlag();

  const setStage = (key: string, stage: FeatureFlagStage) => {
    update.mutate(
      { key, stage },
      {
        onSuccess: () => toast.success(`${key} → ${stage}`),
        onError: () => toast.error("Failed to update stage"),
      },
    );
  };

  const flags = data?.items ?? [];
  const stageOptions = (data?.stages ?? []).map((s) => ({ value: s.value, label: s.label }));

  return (
    <div className="page-enter">
      <PageHeader title="Feature flags" />

      <p className="-mt-2 mb-5 text-sm leading-relaxed text-text-secondary">
        Each flag rolls through four stages —{" "}
        <span className="font-medium">dev → alpha → beta → release</span>. Workspaces only see a
        stage if their testing track allows it: alpha testers see everything, beta testers see beta
        + release, regular workspaces see release only. Dev is reserved for the development
        environment.
      </p>

      <div className="space-y-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" aria-busy="true" />
          ))}

        {!isLoading && flags.length === 0 && (
          <p className="text-sm text-text-tertiary">No feature flags registered yet.</p>
        )}

        {flags.map((flag) => (
          <GlassCard key={flag.key} hover={false}>
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <ToggleLeft size={16} className="text-coffee" />
                  <h3 className="font-serif text-base font-semibold text-text-primary">
                    {flag.label}
                  </h3>
                  {flag.stage === "release" ? (
                    <span className="rounded-full bg-green/15 px-2 py-0.5 text-[11.5px] font-medium uppercase tracking-wide text-green">
                      Released
                    </span>
                  ) : (
                    <FeatureStageBadge stage={flag.stage} />
                  )}
                </div>
                <p className="text-[13.5px] leading-relaxed text-text-secondary">
                  {flag.description}
                </p>
                {/* The key is what appears in code and in support threads. */}
                <p className="mt-2 font-mono text-[11.5px] text-text-tertiary">{flag.key}</p>
              </div>
              <div className="w-36 flex-shrink-0">
                <CustomSelect
                  value={flag.stage}
                  onChange={(v) => setStage(flag.key, v as FeatureFlagStage)}
                  options={stageOptions}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {data?.stages && data.stages.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-[15px] font-semibold text-text-primary">
            Stage cheat sheet
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.stages.map((stage) => (
              <div
                key={stage.value}
                className="rounded-xl border border-glass-border bg-glass-bg p-4 backdrop-blur-md"
              >
                <span
                  className={cn(
                    "mb-1 inline-block rounded-full px-2 py-0.5 text-[11.5px] font-medium uppercase tracking-wide",
                    STAGE_TONE[stage.value],
                  )}
                >
                  {stage.label}
                </span>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
