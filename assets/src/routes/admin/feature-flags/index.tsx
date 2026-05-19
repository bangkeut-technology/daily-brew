import { createFileRoute } from '@tanstack/react-router';
import { ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminFeatureFlags,
  useUpdateAdminFeatureFlag,
  type FeatureFlagStage,
} from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { FeatureStageBadge } from '@/components/shared/FeatureStageBadge';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/feature-flags/')({
  component: AdminFeatureFlagsPage,
});

const STAGE_DESC_TONE: Record<FeatureFlagStage, string> = {
  dev: 'bg-text-tertiary/15 text-text-tertiary',
  alpha: 'bg-amber/15 text-amber',
  beta: 'bg-[#3B6FA0]/15 text-blue',
  release: 'bg-green/15 text-green',
};

function AdminFeatureFlagsPage() {
  const { data, isLoading } = useAdminFeatureFlags();
  const update = useUpdateAdminFeatureFlag();

  const handleStageChange = async (key: string, stage: FeatureFlagStage) => {
    try {
      await update.mutateAsync({ key, stage });
      toast.success(`${key} → ${stage}`);
    } catch {
      toast.error('Failed to update stage');
    }
  };

  const flags = data?.items ?? [];
  const stageOptions = (data?.stages ?? []).map((s) => ({ value: s.value, label: s.label }));

  return (
    <div>
      <PageHeader title="Feature flags" />
      <p className="text-[14px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Each flag rolls through four stages — <span className="font-medium">dev → alpha → beta → release</span>. Workspaces only see a stage if their testing track allows it: alpha testers see everything, beta testers see beta + release, regular workspaces see release only. Dev is reserved for the development environment.
      </p>

      <div className="space-y-4">
        {isLoading && <p className="text-[14px] text-text-tertiary">Loading…</p>}
        {!isLoading && flags.length === 0 && (
          <p className="text-[14px] text-text-tertiary">No feature flags registered yet.</p>
        )}
        {flags.map((flag) => (
          <GlassCard key={flag.key} hover={false}>
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <ToggleLeft size={16} className="text-coffee" />
                  <h3 className="text-[16px] font-semibold text-text-primary font-serif">{flag.label}</h3>
                  {flag.stage === 'release' ? (
                    <span className="text-[11.5px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide bg-green/15 text-green">
                      Released
                    </span>
                  ) : (
                    <FeatureStageBadge stage={flag.stage} />
                  )}
                </div>
                <p className="text-[13.5px] text-text-secondary leading-relaxed">
                  {flag.description}
                </p>
                <p className="mt-2 text-[11.5px] font-mono text-text-tertiary">
                  {flag.key}
                </p>
              </div>
              <div className="w-36 flex-shrink-0">
                <CustomSelect
                  value={flag.stage}
                  onChange={(v) => handleStageChange(flag.key, v as FeatureFlagStage)}
                  options={stageOptions}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {data?.stages && (
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-text-primary font-serif mb-3">Stage cheat sheet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.stages.map((stage) => (
              <div key={stage.value} className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-[11.5px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide', STAGE_DESC_TONE[stage.value])}>
                    {stage.label}
                  </span>
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
