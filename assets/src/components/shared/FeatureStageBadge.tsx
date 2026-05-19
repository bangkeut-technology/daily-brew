import { cn } from '@/lib/utils';
import type { FeatureFlagStage } from '@/hooks/queries/useAdmin';

const TONE: Record<Exclude<FeatureFlagStage, 'release'>, string> = {
  dev: 'bg-text-tertiary/15 text-text-tertiary',
  alpha: 'bg-amber/15 text-amber',
  beta: 'bg-[#3B6FA0]/15 text-blue',
};

const LABEL: Record<Exclude<FeatureFlagStage, 'release'>, string> = {
  dev: 'Dev',
  alpha: 'Alpha',
  beta: 'Beta',
};

/**
 * Compact pill showing a feature flag's current rollout stage. Renders
 * nothing for release-stage features — once shipped, the badge would
 * just be noise next to general-availability surfaces.
 */
export function FeatureStageBadge({
  stage,
  className,
}: {
  stage: FeatureFlagStage;
  className?: string;
}) {
  if (stage === 'release') return null;
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide',
        TONE[stage],
        className,
      )}
    >
      {LABEL[stage]}
    </span>
  );
}
