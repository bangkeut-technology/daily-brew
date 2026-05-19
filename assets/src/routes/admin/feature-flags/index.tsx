import { createFileRoute } from '@tanstack/react-router';
import { ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminFeatureFlags, useUpdateAdminFeatureFlag } from '@/hooks/queries/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Toggle } from '@/components/shared/Toggle';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const Route = createFileRoute('/admin/feature-flags/')({
  component: AdminFeatureFlagsPage,
});

function AdminFeatureFlagsPage() {
  const { data, isLoading } = useAdminFeatureFlags();
  const update = useUpdateAdminFeatureFlag();

  const handleToggle = async (key: string, enabled: boolean) => {
    try {
      await update.mutateAsync({ key, enabled });
      toast.success(enabled ? `${key} turned on` : `${key} turned off`);
    } catch {
      toast.error('Failed to update flag');
    }
  };

  return (
    <div>
      <PageHeader title="Feature flags" />
      <p className="text-[14px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        Platform-level on/off switches. Modules listed here have been deployed but are hidden across the product until turned on. The catalog is fixed in code (
        <code className="font-mono text-[12.5px] px-1 py-0.5 rounded bg-cream-3/60">src/Enum/FeatureFlagEnum.php</code>
        ); the toggle below stores the state.
      </p>

      <div className="space-y-4">
        {isLoading && (
          <p className="text-[14px] text-text-tertiary">Loading…</p>
        )}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-[14px] text-text-tertiary">No feature flags registered yet.</p>
        )}
        {(data ?? []).map((flag) => (
          <GlassCard key={flag.key} hover={false}>
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <ToggleLeft size={16} className="text-coffee" />
                  <h3 className="text-[16px] font-semibold text-text-primary font-serif">{flag.label}</h3>
                  {flag.enabled ? (
                    <StatusBadge label="On" variant="green" />
                  ) : (
                    <StatusBadge label="Off" variant="gray" />
                  )}
                </div>
                <p className="text-[13.5px] text-text-secondary leading-relaxed">
                  {flag.description}
                </p>
                <p className="mt-2 text-[11.5px] font-mono text-text-tertiary">
                  {flag.key}
                </p>
              </div>
              <Toggle
                id={`flag-${flag.key}`}
                checked={flag.enabled}
                onChange={(v) => handleToggle(flag.key, v)}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
